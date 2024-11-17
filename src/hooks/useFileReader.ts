import { useState } from 'react';
import { DdcClient, File, FileUri, MAINNET, TESTNET } from '@cere-ddc-sdk/ddc-client';
import { useDdcClient } from './useDdcClient';

export const useFileReader = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { client } = useDdcClient();

    const readFile = async (bucketId: bigint, cid: string) => {
        if(!client) return;

        setIsLoading(true);
        setError(null);

        try {
            const fileUri = new FileUri(bucketId, cid);
            const fileResponse = await client.read(fileUri);
        
            // Create a Blob URL for the file
            const blob = await fileResponse.text();
            const url = URL.createObjectURL(blob);

            console.log('File read successfully:', url);
            return url; // Return the URL for use in components
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to read file');
            console.error('Error reading file:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const readSharedFile = async (bucketId: bigint, cid: string, accessToken: string) => {
        if(!client) return;

        setIsLoading(true);
        setError(null);

        try {
            // should be i think the whole uri not just the cid
            const fileResponse = await client.read({ bucketId, cid }, accessToken);

            // Create a Blob URL for the file
            const blob = await fileResponse.blob();
            const url = URL.createObjectURL(blob);

            console.log('File read successfully:', url);
            return url; // Return the URL for use in components
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to read file');
            console.error('Error reading file:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return { readFile, readSharedFile, isLoading, error };
};