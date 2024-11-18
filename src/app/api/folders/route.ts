import { db } from "@/lib/firebase";
import { NextResponse } from "next/server";
import { FolderMetadata } from "@/types";

export async function POST(request: Request) {
  const folderMetadata: FolderMetadata = await request.json();

  try {
    await db.collection("folders").doc(folderMetadata.name).set(folderMetadata);
    return NextResponse.json({ message: "Folder created successfully" });
  } catch (error) {
    console.error("Error creating folder:", error);
    return NextResponse.json({ error: "Failed to create folder" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get("walletAddress");

  if (!walletAddress) {
    return NextResponse.json({ error: "Wallet address is required" }, { status: 400 });
  }

  try {
    const snapshot = await db.collection("folders").where("createdBy", "==", walletAddress).get();
    const folders = snapshot.docs.map((doc) => doc.data() as FolderMetadata);
    return NextResponse.json(folders);
  } catch (error) {
    console.error("Error fetching folders:", error);
    return NextResponse.json({ error: "Failed to fetch folders" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const folderId = searchParams.get("folderId");

  if (!folderId) {
    return NextResponse.json({ error: "Folder ID is required" }, { status: 400 });
  }

  try {
    await deleteFolderRecursively(folderId);
    return NextResponse.json({ message: "Folder deleted successfully" });
  } catch (error) {
    console.error("Error deleting folder:", error);
    return NextResponse.json({ error: "Failed to delete folder" }, { status: 500 });
  }
}

async function deleteFolderRecursively(folderId: string) {
  // Delete the folder
  await db.collection("folders").doc(folderId).delete();

  // Delete all child folders recursively
  const childFolders = await db.collection("folders").where("parentFolderId", "==", folderId).get();
  const deleteFolderPromises = childFolders.docs.map((doc) => deleteFolderRecursively(doc.id));
  await Promise.all(deleteFolderPromises);
}