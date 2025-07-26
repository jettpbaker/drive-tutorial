"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "./db";
import { files_table, folders_table } from "./db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import { cookies } from "next/headers";
import { MUTATIONS } from "./db/queries";

const ut = new UTApi();

export async function deleteFile(fileId: number) {
  const session = await auth();
  if (!session.userId) return { error: "Unauthorized" };

  const [file] = await db
    .select()
    .from(files_table)
    .where(
      and(eq(files_table.id, fileId), eq(files_table.ownerId, session.userId)),
    );

  if (!file) return { error: "File not found" };

  const utapiResult = await ut.deleteFiles([
    file.url.replace("https://33oyh40v94.ufs.sh/f/", ""),
  ]);
  console.log(utapiResult);

  const dbDeleteResult = await db
    .delete(files_table)
    .where(eq(files_table.id, fileId));
  console.log(dbDeleteResult);

  const c = await cookies();
  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true };
}

export async function deleteFolder(folderId: number) {
  const session = await auth();
  if (!session.userId) return { error: "Unauthorized" };

  const [folder] = await db
    .select()
    .from(folders_table)
    .where(
      and(
        eq(folders_table.id, folderId),
        eq(folders_table.ownerId, session.userId),
      ),
    );

  if (!folder) return { error: "Folder not found" };

  async function getAllDescendants(currentFolderId: number) {
    const allFiles: (typeof files_table.$inferSelect)[] = [];
    const allFolders: (typeof folders_table.$inferSelect)[] = [];

    async function traverse(folderId: number) {
      const files = await db
        .select()
        .from(files_table)
        .where(eq(files_table.parent, folderId));

      const folders = await db
        .select()
        .from(folders_table)
        .where(eq(folders_table.parent, folderId));

      allFiles.unshift(...files);
      allFolders.unshift(...folders);

      for (const subfolder of folders) {
        await traverse(subfolder.id);
      }
    }

    await traverse(currentFolderId);
    return { allFiles, allFolders };
  }

  const { allFiles, allFolders } = await getAllDescendants(folderId);
  allFolders.unshift(folder);

  if (allFiles.length > 0) {
    const utapiResult = await ut.deleteFiles(
      allFiles
        .filter((file) => file.url)
        .map((file) => file.url.replace("https://33oyh40v94.ufs.sh/f/", "")),
    );
    console.log(utapiResult);
  }

  await db.transaction(async (tx) => {
    if (allFiles.length > 0) {
      await tx.delete(files_table).where(
        inArray(
          files_table.id,
          allFiles.map((file) => file.id),
        ),
      );
    }

    if (allFolders.length > 0) {
      await tx.delete(folders_table).where(
        inArray(
          folders_table.id,
          allFolders.map((folder) => folder.id),
        ),
      );
    }
  });

  const c = await cookies();
  c.set("force-refresh", JSON.stringify(Math.random()));

  return { success: true };
}

export async function createFolder(parentId: number, name: string) {
  const session = await auth();
  if (!session.userId) return { error: "Unauthorized" };

  try {
    await MUTATIONS.createFolder(parentId, name, session.userId);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to create folder" };
  } finally {
    const c = await cookies();
    c.set("force-refresh", JSON.stringify(Math.random()));
  }
}
