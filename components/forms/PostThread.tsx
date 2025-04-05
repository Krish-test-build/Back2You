"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { useOrganization } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { ThreadValidation } from "@/lib/validations/thread";
import { createThread } from "@/lib/actions/thread.actions";

interface Props {
  userId: string;
}

function PostThread({ userId }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const { organization } = useOrganization();

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const form = useForm<z.infer<typeof ThreadValidation>>({
    resolver: zodResolver(ThreadValidation),
    defaultValues: {
      thread: "",
      accountId: userId,
      image: "",
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes("image")) {
      alert("Please upload an image file");
      return;
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const onSubmit = async (values: z.infer<typeof ThreadValidation>) => {
    try {
      setIsSubmitting(true);

      if (selectedImage) {
        const formData = new FormData();
        formData.append("image", selectedImage);

        const response = await fetch("/api/uploadImage", {
          method: "POST",
          body: formData,
        });

        const { imageId } = await response.json();

        await createThread({
          text: values.thread,
          author: userId,
          communityId: organization ? organization.id : null,
          path: pathname,
          imageId: imageId, // Pass the image ID instead of the file
        });
      } else {
        await createThread({
          text: values.thread,
          author: userId,
          communityId: organization ? organization.id : null,
          path: pathname,
        });
      }

      form.reset();
      setSelectedImage(null);
      setPreviewUrl("");
      router.push("/");
    } catch (error) {
      console.error("Error creating thread:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        className="mt-10 flex flex-col justify-start gap-10"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="thread"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-3">
              <FormLabel className="text-base-semibold text-light-2">
                Content
              </FormLabel>
              <FormControl className="no-focus border border-dark-4 bg-dark-3 text-light-1">
                <Textarea rows={15} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-3">
          <FormLabel className="text-base-semibold text-light-2">
            Add Image
          </FormLabel>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="text-light-1"
          />
          {previewUrl && (
            <div className="mt-2 w-full max-w-md">
              <Image
                src={previewUrl}
                alt="Preview"
                width={300}
                height={300}
                className="rounded-lg object-cover"
              />
            </div>
          )}
        </div>

        <Button 
          type="submit" 
          className="bg-primary-500" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Posting..." : "Post Thread"}
        </Button>
      </form>
    </Form>
  );
}

export default PostThread;
