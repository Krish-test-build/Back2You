import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import CreateCommunityForm from "@/components/forms/CreateCommunityForm";

async function Page() {
  const user = await currentUser();
  if (!user) redirect("/");

  return (
    <section className="p-6">
      <h1 className="text-2xl font-bold mb-4">Create a Community</h1>
      <CreateCommunityForm userId={user.id} />
    </section>
  );
}

export default Page;
