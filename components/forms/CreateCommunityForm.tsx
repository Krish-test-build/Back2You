"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

const CommunitySchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  username: z.string().min(3, "Username must be at least 3 characters long"),
  image: z.string().url("Must be a valid URL"),
  bio: z.string().optional(),
});

type CommunityFormValues = z.infer<typeof CommunitySchema>;

function CreateCommunityForm({ userId }: { userId: string }) {
  const router = useRouter();
  const form = useForm<CommunityFormValues>({
    resolver: zodResolver(CommunitySchema),
  });

  const onSubmit = async (values: CommunityFormValues) => {
    try {
      const response = await fetch("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, createdById: userId }),
      });

      if (!response.ok) throw new Error("Failed to create community");

      router.push("/communities");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input {...form.register("name")} placeholder="Community Name" />
      <Input {...form.register("username")} placeholder="Community Username" />
      <Input {...form.register("image")} placeholder="Image URL" />
      <Textarea {...form.register("bio")} placeholder="Community Bio" />
      <Button type="submit">Create Community</Button>
    </form>
  );
}

export default CreateCommunityForm;
