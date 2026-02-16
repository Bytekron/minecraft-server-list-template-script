'use client';

import React, { useState } from 'react';
import { MyServers } from '../../components/MyServers';
import { AddServerModal } from '../../components/AddServerModal';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function MyServersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isAddServerModalOpen, setIsAddServerModalOpen] = useState(false);

  const handleAddServer = () => {
    if (!user) {
      router.push('/');
      return;
    }
    setIsAddServerModalOpen(true);
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <>
      <MyServers 
        onAddServer={handleAddServer}
        onBackToHome={handleBackToHome}
      />
      
      {isAddServerModalOpen && (
        <AddServerModal
          isOpen={isAddServerModalOpen}
          onClose={() => setIsAddServerModalOpen(false)}
        />
      )}
    </>
  );
}