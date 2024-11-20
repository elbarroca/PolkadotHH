'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, Wallet, Lock, Layout } from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className='flex flex-1 flex-col items-center justify-center bg-gray-900 px-4'>
      <div className='mx-auto max-w-4xl space-y-8 text-center'>
        <div className='space-y-4'>
          <h1 className='bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-5xl font-bold text-gray-100 text-transparent'>
            Secure, Decentralized File Sharing
          </h1>
          <p className='mx-auto max-w-2xl text-xl text-gray-400'>
            Unlock the future of privacy with blockchain-based file storage and
            sharing.
          </p>
        </div>

        <div className='mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
          {[
            {
              icon: <Wallet className='h-8 w-8 text-emerald-400' />,
              title: 'Blockchain Login',
              description:
                'Connect your wallet for secure, password-free access',
            },
            {
              icon: <Lock className='h-8 w-8 text-emerald-400' />,
              title: 'Encrypted Storage',
              description: 'Auto-encryption with decentralized storage',
            },
            {
              icon: <Users className='h-8 w-8 text-emerald-400' />,
              title: 'Access Control',
              description: 'Choose who can view your files',
            },
            {
              icon: <Layout className='h-8 w-8 text-emerald-400' />,
              title: 'File Dashboard',
              description: 'Track and manage your files easily',
            },
          ].map((feature, i) => (
            <div
              key={i}
              className='group relative rounded-xl border border-gray-700 bg-gray-800 p-6 transition-all duration-300 hover:border-emerald-500/50'
            >
              <div className='absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/10 to-emerald-700/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
              <div className='relative space-y-4'>
                <div className='w-fit rounded-lg bg-gray-900/50 p-3'>
                  {feature.icon}
                </div>
                <h3 className='text-lg font-semibold text-gray-100'>
                  {feature.title}
                </h3>
                <p className='text-gray-400'>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className='mt-16 rounded-xl border border-gray-700 bg-gray-800/50 p-6'>
          <h3 className='mb-4 text-xl font-semibold text-gray-100'>
            Simple Upload Process
          </h3>
          <div className='flex items-center justify-center space-x-4'>
            {[
              { step: '1', text: 'Select File' },
              { step: '2', text: 'Specify Viewers' },
              { step: '3', text: 'Upload & Encrypt' },
            ].map((step, i, arr) => (
              <React.Fragment key={i}>
                <div className='flex flex-col items-center'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 font-bold text-emerald-400'>
                    {step.step}
                  </div>
                  <p className='mt-2 text-sm text-gray-400'>{step.text}</p>
                </div>
                {i < arr.length - 1 && (
                  <div className='h-px w-12 bg-gray-700' />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
