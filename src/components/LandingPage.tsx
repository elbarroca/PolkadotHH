'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, Wallet, Lock, Layout } from 'lucide-react';
import { useWallet } from '@/components/wallet/WalletTest';

export const LandingPage = () => {
  const { connectWallet, isLoading } = useWallet();

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-gray-900 px-4">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-gray-100 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600">
            Secure, Decentralized File Sharing
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Unlock the future of privacy with blockchain-based file storage and sharing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {[
            {
              icon: <Wallet className="h-8 w-8 text-emerald-400" />,
              title: "Blockchain Login",
              description: "Connect your wallet for secure, password-free access"
            },
            {
              icon: <Lock className="h-8 w-8 text-emerald-400" />,
              title: "Encrypted Storage",
              description: "Auto-encryption with decentralized storage"
            },
            {
              icon: <Users className="h-8 w-8 text-emerald-400" />,
              title: "Access Control",
              description: "Choose who can view your files"
            },
            {
              icon: <Layout className="h-8 w-8 text-emerald-400" />,
              title: "File Dashboard",
              description: "Track and manage your files easily"
            }
          ].map((feature, i) => (
            <div 
              key={i}
              className="group relative p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-emerald-500/50 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-emerald-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
              <div className="relative space-y-4">
                <div className="p-3 bg-gray-900/50 rounded-lg w-fit">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-100">
                  {feature.title}
                </h3>
                <p className="text-gray-400">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 p-6 bg-gray-800/50 rounded-xl border border-gray-700">
          <h3 className="text-xl font-semibold text-gray-100 mb-4">
            Simple Upload Process
          </h3>
          <div className="flex items-center justify-center space-x-4">
            {[
              { step: "1", text: "Select File" },
              { step: "2", text: "Specify Viewers" },
              { step: "3", text: "Upload & Encrypt" }
            ].map((step, i, arr) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center">
                  <div className="h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    {step.step}
                  </div>
                  <p className="mt-2 text-sm text-gray-400">{step.text}</p>
                </div>
                {i < arr.length - 1 && (
                  <div className="h-px w-12 bg-gray-700" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <Button
          onClick={connectWallet}
          disabled={isLoading}
          className="mt-8 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg text-lg"
        >
          {isLoading ? 'Connecting...' : 'Connect Wallet to Start'}
        </Button>
      </div>
    </div>
  );
};