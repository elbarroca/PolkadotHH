'use client';
import { GeneralDashboard } from "@/components/GeneralDashboard";
import { LandingPage } from "@/components/LandingPage";
import { useWallet } from "@/contexts/WalletProvider";
import { useStorage } from "@/hooks/useStorage";

export default function Home() {
  const { folders } = useStorage();
  const { activeAccount } = useWallet();

  return (
    <div className="flex h-screen flex-col bg-gray-900">
      {activeAccount ? (
        <GeneralDashboard folders={folders} />
      ) : (
        <LandingPage />
      )}
    </div>
  );
}