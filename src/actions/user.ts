"use server";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
// =================================
import { db } from "@/drizzle/db";
import { UserTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function updateOnboarding(phone: string) {
  // authenticate
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { error: "Unauthorized" };
  const client = await clerkClient();

  try {
    // update metadata
    const user = await client.users.getUser(clerkUserId);
    const currentMetadata = user.publicMetadata as UserPublicMetadata;
    await client.users.updateUser(clerkUserId, {
      publicMetadata: {
        ...currentMetadata,
        onboardingComplete: true,
      },
    });

    // update phone number
    await updateUser({ clerkUserId: clerkUserId }, { phone });
    return { success: true };
  } catch (error) {
    console.log("error -> ", error);
    return { error: "Failed to update onboarding. Try again." };
  }
}

export async function insertUser(data: typeof UserTable.$inferInsert) {
  const [newUser] = await db
    .insert(UserTable)
    .values(data)
    .returning()
    .onConflictDoUpdate({
      target: [UserTable.clerkUserId],
      set: data,
    });

  if (newUser == null) throw new Error("Failed to create user");

  return newUser;
}

export async function updateUser(
  { clerkUserId }: { clerkUserId: string },
  data: Partial<typeof UserTable.$inferInsert>,
) {
  const [updatedUser] = await db
    .update(UserTable)
    .set(data)
    .where(eq(UserTable.clerkUserId, clerkUserId))
    .returning();

  if (updatedUser == null) throw new Error("Failed to update user");

  return updatedUser;
}

export async function deleteUser({ clerkUserId }: { clerkUserId: string }) {
  const [deletedUser] = await db
    .update(UserTable)
    .set({
      deletedAt: new Date(),
      email: "redacted@deleted.com",
      name: "Deleted User",
      clerkUserId: "deleted",
    })
    .where(eq(UserTable.clerkUserId, clerkUserId))
    .returning();

  if (deletedUser == null) throw new Error("Failed to delete user");

  return deletedUser;
}

export async function getUserByClerkId(clerkUserId: string) {
  try {
    const user = await db
      .select()
      .from(UserTable)
      .where(eq(UserTable.clerkUserId, clerkUserId));
    return user[0];
  } catch (error) {
    console.error("Error getting user by clerkId:", error);
    return null;
  }
}
