import { db } from '@/lib/firebase';
import { NextResponse } from 'next/server';
import { FileMetadata, FolderMetadata } from '@/types';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: Request) {
  const metadata: FileMetadata | FolderMetadata = await request.json();

  try {
    let userDocRef;
    if ('uploadedBy' in metadata) {
      userDocRef = db.collection('users').doc(metadata.uploadedBy);
    } else {
      userDocRef = db.collection('users').doc(metadata.createdBy);
    }

    if ('cid' in metadata) {
      // File metadata
      const fileMetadata = metadata as FileMetadata;

      if (fileMetadata.folder) {
        const folderRef = userDocRef
          .collection('folders')
          .doc(fileMetadata.folder);
        await folderRef.update({
          files: FieldValue.arrayUnion(fileMetadata),
        });
        console.log('Folder updated with file metadata');
      }

      // the files objects are inside the folders
      //const fileCollectionRef = userDocRef.collection("files");
      //await fileCollectionRef.doc(fileMetadata.cid).set(fileMetadata);
    } else {
      // Folder metadata
      const folderMetadata = metadata as FolderMetadata;
      const foldersCollectionRef = userDocRef.collection('folders');
      await foldersCollectionRef.doc(folderMetadata.name).set(folderMetadata);
    }

    return NextResponse.json({ message: 'Metadata created successfully' });
  } catch (error) {
    console.error('Error creating metadata:', error);
    return NextResponse.json(
      { error: 'Failed to create metadata' },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get('walletAddress');

  if (!walletAddress) {
    return NextResponse.json(
      { error: 'Wallet address is required' },
      { status: 400 },
    );
  }

  try {
    const userDocRef = db.collection('users').doc(walletAddress);
    const foldersSnapshot = await userDocRef.collection('folders').get();

    const foldersWithFiles = await Promise.all(
      foldersSnapshot.docs.map(async (folderDoc) => {
        const folderData = folderDoc.data() as FolderMetadata;
        return {
          ...folderData,
        };
      }),
    );

    return NextResponse.json(foldersWithFiles);
  } catch (error) {
    console.error('Error retrieving folders and files:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve folders and files' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get('walletAddress');
  const metadataId = searchParams.get('metadataId');
  const type = searchParams.get('type');

  if (!walletAddress || !metadataId || !type) {
    return NextResponse.json(
      { error: 'Wallet address, metadata ID, and type are required' },
      { status: 400 },
    );
  }

  try {
    const userDocRef = db.collection('users').doc(walletAddress);

    if (type === 'file') {
      await userDocRef.collection('files').doc(metadataId).delete();
    } else if (type === 'folder') {
      await deleteFolderRecursively(walletAddress, metadataId);
    } else {
      return NextResponse.json(
        { error: 'Invalid type parameter' },
        { status: 400 },
      );
    }

    return NextResponse.json({ message: 'Metadata deleted successfully' });
  } catch (error) {
    console.error('Error deleting metadata:', error);
    return NextResponse.json(
      { error: 'Failed to delete metadata' },
      { status: 500 },
    );
  }
}

async function deleteFolderRecursively(
  walletAddress: string,
  folderId: string,
) {
  const userDocRef = db.collection('users').doc(walletAddress);
  await userDocRef.collection('folders').doc(folderId).delete();
  const childFolders = await userDocRef
    .collection('folders')
    .where('parentFolder', '==', folderId)
    .get();
  const deleteFolderPromises = childFolders.docs.map((doc) =>
    deleteFolderRecursively(walletAddress, doc.id),
  );
  await Promise.all(deleteFolderPromises);
}
