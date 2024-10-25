'use client';

import { Button, ButtonProps } from '@chakra-ui/react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface SignOutButtonProps extends ButtonProps {
  redirectTo?: string;
}

export function SignOutButton({ redirectTo = '/', ...props }: SignOutButtonProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push(redirectTo);
  };

  return (
    <Button
      onClick={handleSignOut}
      variant="ghost"
      colorScheme="red"
      {...props}
    >
      Sign Out
    </Button>
  );
}
