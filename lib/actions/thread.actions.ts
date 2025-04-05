"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { connectToDB } from "@/lib/mongoose";
import User from "../models/user.model";
import Thread from "../models/thread.model";
import Community from "../models/community.model";
import Image from "../models/image.model";

// Ensure DB is connected before all operations
async function ensureDBConnection() {
  if (mongoose.connection.readyState === 0) {
    await connectToDB();
  }
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  try {
    await connectToDB();

    const posts = await Thread.find()
      .sort({ createdAt: "desc" })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .populate({
        path: "author",
        model: User,
        select: "_id name image"
      })
      .populate({
        path: "community",
        model: Community
      })
      .populate({
        path: "children",
        model: Thread,
        populate: {
          path: "author",
          model: User,
          select: "_id name image"
        }
      })
      .populate({
        path: "image",
        model: Image
      });

    return { posts: posts.map(post => post.toObject()) };
  } catch (error: any) {
    console.error("Fetch posts error:", error);
    throw new Error(`Failed to fetch posts: ${error.message}`);
  }
}

export async function createThread({
  text,
  author,
  communityId,
  path,
  imageId
}: {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
  imageId?: string;
}) {
  try {
    await ensureDBConnection();

    const threadData = {
      text,
      author,
      community: communityId,
      image: imageId ? new mongoose.Types.ObjectId(imageId) : undefined
    };

    const createdThread = await Thread.create(threadData);

    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });

    revalidatePath(path);
    return createdThread;

  } catch (error: any) {
    throw new Error(`Failed to create thread: ${error.message}`);
  }
}

async function fetchAllChildThreads(threadId: string): Promise<any[]> {
  const childThreads = await Thread.find({ parentId: threadId });
  const descendantThreads = [];

  for (const childThread of childThreads) {
    const descendants = await fetchAllChildThreads(childThread._id);
    descendantThreads.push(childThread, ...descendants);
  }

  return descendantThreads;
}

export async function deleteThread(id: string, path: string): Promise<void> {
  try {
    await ensureDBConnection();

    const mainThread = await Thread.findById(id).populate("author community");

    if (!mainThread) throw new Error("Thread not found");

    const descendantThreads = await fetchAllChildThreads(id);
    const descendantThreadIds = [id, ...descendantThreads.map(t => t._id)];

    const uniqueAuthorIds = new Set([
      ...descendantThreads.map(t => t.author?._id?.toString()),
      mainThread.author?._id?.toString(),
    ].filter(Boolean));

    const uniqueCommunityIds = new Set([
      ...descendantThreads.map(t => t.community?._id?.toString()),
      mainThread.community?._id?.toString(),
    ].filter(Boolean));

    await Thread.deleteMany({ _id: { $in: descendantThreadIds } });

    await User.updateMany(
      { _id: { $in: Array.from(uniqueAuthorIds) } },
      { $pull: { threads: { $in: descendantThreadIds } } }
    );

    await Community.updateMany(
      { _id: { $in: Array.from(uniqueCommunityIds) } },
      { $pull: { threads: { $in: descendantThreadIds } } }
    );

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to delete thread: ${error.message}`);
  }
}

export async function fetchThreadById(threadId: string) {
  await ensureDBConnection();

  try {
    const thread = await Thread.findById(threadId)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      })
      .populate({
        path: "community",
        model: Community,
        select: "_id id name image",
      })
      .populate({
        path: "children",
        populate: [
          {
            path: "author",
            model: User,
            select: "_id id name parentId image",
          },
          {
            path: "children",
            model: Thread,
            populate: {
              path: "author",
              model: User,
              select: "_id id name parentId image",
            },
          },
        ],
      })
      .exec();

    return thread;
  } catch (err) {
    console.error("Error while fetching thread:", err);
    throw new Error("Unable to fetch thread");
  }
}

export async function addCommentToThread(
  threadId: string,
  commentText: string,
  userId: string,
  path: string
) {
  await ensureDBConnection();

  try {
    const originalThread = await Thread.findById(threadId);
    if (!originalThread) throw new Error("Thread not found");

    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId,
    });

    const savedCommentThread = await commentThread.save();

    originalThread.children.push(savedCommentThread._id);
    await originalThread.save();

    revalidatePath(path);
  } catch (err) {
    console.error("Error while adding comment:", err);
    throw new Error("Unable to add comment");
  }
}
