'use client';

import { GeneralDashboard } from "@/components/GeneralDashboard";
import { LandingPage } from "@/components/LandingPage";
import { useWallet } from "@/components/wallet/WalletTest";
import { Header } from "@/components/Header";
import { useState } from "react";

export default function Home() {
  const { activeAccount } = useWallet();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex h-screen flex-col bg-gray-900">
      <Header onSearch={setSearchQuery} searchQuery={searchQuery} />
      {activeAccount ? (
        <GeneralDashboard folders={[]} />
      ) : (
        <LandingPage />
      )}
    </div>
  );
}