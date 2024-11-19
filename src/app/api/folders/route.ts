import { db } from "@/lib/firebase";
import { NextResponse } from "next/server";
import { FolderMetadata } from "@/types";

export async function POST(request: Request) {
  const folderMetadata: FolderMetadata = await request.json();

  try {
    const userDocRef = db.collection("users").doc(folderMetadata.createdBy);
    const foldersCollectionRef = userDocRef.collection("folders");
    await foldersCollectionRef.doc(folderMetadata.name).set(folderMetadata);

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
    const userDocRef = db.collection("users").doc(walletAddress);
    const snapshot = await userDocRef.collection("folders").get();
    const folders = snapshot.docs.map((doc) => doc.data() as FolderMetadata);
    return NextResponse.json(folders);
  } catch (error) {
    console.error("Error fetching folders:", error);
    return NextResponse.json({ error: "Failed to fetch folders" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get("walletAddress");
  const folderId = searchParams.get("folderId");

  if (!walletAddress || !folderId) {
    return NextResponse.json({ error: "Wallet address and Folder ID are required" }, { status: 400 });
  }

  try {
    await deleteFolderRecursively(walletAddress, folderId);
    return NextResponse.json({ message: "Folder deleted successfully" });
  } catch (error) {
    console.error("Error deleting folder:", error);
    return NextResponse.json({ error: "Failed to delete folder" }, { status: 500 });
  }
}

async function deleteFolderRecursively(walletAddress: string, folderId: string) {
  const userDocRef = db.collection("users").doc(walletAddress);
  await userDocRef.collection("folders").doc(folderId).delete();
  const childFolders = await userDocRef.collection("folders").where("parentFolderId", "==", folderId).get();
  const deleteFolderPromises = childFolders.docs.map((doc) => deleteFolderRecursively(walletAddress, doc.id));
  await Promise.all(deleteFolderPromises);
}