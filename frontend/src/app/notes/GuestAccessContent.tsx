'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUsageCount, incrementUsageCount, checkUsageLimit, GUEST_LIMIT } from '@/lib/guest-usage';
import { RegistrationWallModal } from '@/components/registration-wall-modal';

interface GuestAccessContentProps {
  initialNotes: any[];
  isUserAuthenticated: boolean;
}

export default function GuestAccessContent({ initialNotes, isUserAuthenticated }: GuestAccessContentProps) {
  const router = useRouter();
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [currentUsage, setCurrentUsage] = useState(0);

  useEffect(() => {
    if (!isUserAuthenticated) {
      setCurrentUsage(getUsageCount());
    }
  }, [isUserAuthenticated]);

  useEffect(() => {
    if (!isUserAuthenticated && checkUsageLimit()) {
      setShowRegistrationModal(true);
    } else {
      setShowRegistrationModal(false);
    }
  }, [isUserAuthenticated, currentUsage]); // Add currentUsage as dependency

  const handleFeatureUse = () => {
    if (!isUserAuthenticated) {
      if (!checkUsageLimit()) {
        incrementUsageCount();
        setCurrentUsage(getUsageCount());
      } else {
        setShowRegistrationModal(true);
      }
    }
    // Simulate core feature usage by displaying notes
    // In a real app, this would be an actual API call or feature action
  };

  const handleModalClose = () => {
    setShowRegistrationModal(false);
    // Optionally redirect if the user closes the modal without action
    // For now, we'll let them stay on the page with the modal gone, but blocked.
    // If we want a hard redirect: router.push('/login');
  };

  if (isUserAuthenticated) {
    // Authenticated user experience
    return <pre>{JSON.stringify(initialNotes, null, 2)}</pre>;
  }

  // Guest user experience
  // If the limit is reached, we still render the content but block interaction or show the modal
  if (checkUsageLimit()) {
    return (
      <>
        <h1>Guest Mode - Access Blocked</h1>
        <p>You have used your {GUEST_LIMIT} free accesses. Please log in or register.</p>
        <RegistrationWallModal
          isOpen={showRegistrationModal}
          onClose={handleModalClose}
          message={`You've used all your ${GUEST_LIMIT} free accesses. Please log in or register to continue!`}
        />
        {/* Potentially render a blurred/disabled version of the content here */}
      </>
    );
  }

  // Guest user, limit not reached
  return (
    <>
      <h1>Guest Mode - Limited Access</h1>
      <p>You have {currentUsage} out of {GUEST_LIMIT} free uses. Please log in or register for full access.</p>
      <button onClick={handleFeatureUse}>Use Core Feature (Simulated)</button> {/* Simulated usage */}
      <pre>{JSON.stringify(initialNotes, null, 2)}</pre>
      <RegistrationWallModal
        isOpen={showRegistrationModal}
        onClose={handleModalClose}
      />
    </>
  );
}
