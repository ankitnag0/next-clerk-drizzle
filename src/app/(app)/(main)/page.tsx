import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  const user = await currentUser();
  return (
    <div className="flex flex-col items-center gap-10">
      <div className="text-4xl font-bold ">👋 Hello {user?.firstName} !</div>
    </div>
  );
}
