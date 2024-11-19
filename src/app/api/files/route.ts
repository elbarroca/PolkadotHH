import { db } from "@/lib/firebase";
import { NextResponse } from "next/server";
import { FileMetadata, FolderMetadata } from "@/types";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: Request) {
  const fileMetadata: FileMetadata = await request.json();

  try {
    const userDocRef = db.collection("users").doc(fileMetadata.uploadedBy);
    const filesCollectionRef = userDocRef.collection("folder");

    await filesCollectionRef.doc(fileMetadata.cid).set(fileMetadata);

    if (fileMetadata.folder) {
      const folderRef = userDocRef.collection("folders").doc(fileMetadata.folder);
      await folderRef.update({
        files: FieldValue.arrayUnion(fileMetadata)
      });
    }

    return NextResponse.json({ message: "File metadata created successfully" });
  } catch (error) {
    console.error("Error creating file metadata:", error);
    return NextResponse.json({ error: "Failed to create file metadata" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get("walletAddress");
  const type = searchParams.get("type");

  if (!walletAddress) {
    return NextResponse.json({ error: "Wallet address is required" }, { status: 400 });
  }

  try {
    const filesCollection = await db.collection("users").doc(walletAddress).collection("folders").get();
    /*let query = filesCollection.docs.where("uploadedBy", "==", walletAddress);

    if (type === "shared") {
      query = query.where("authorizedUsers", "array-contains", walletAddress);
    }

    const snapshot = await query.get();
    const files = snapshot.docs.map((doc) => doc.data() as FileMetadata);
    */
    return NextResponse.json(filesCollection);
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
}