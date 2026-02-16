'use client';

import React from 'react';
import { EditAccount } from '../../components/EditAccount';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function EditAccountPage() {
  const router = useRouter();
  const { user } = useAuth();

  const handleBackToHome = () => {
    router.push('/');
  };

  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <EditAccount 
      onBackToHome={handleBackToHome}
    />
  );
}