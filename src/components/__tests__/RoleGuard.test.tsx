import { render, screen } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { RoleGuard } from '../RoleGuard';
import { UserRole } from '@/types/auth';

jest.mock('next-auth/react');

describe('RoleGuard', () => {
  const mockUseSession = useSession as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when user has allowed role', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          role: UserRole.ADMIN,
        },
      },
      status: 'authenticated',
    });

    render(
      <RoleGuard allowedRoles={[UserRole.ADMIN]}>
        <div>Protected Content</div>
      </RoleGuard>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders fallback when user does not have allowed role', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          role: UserRole.USER,
        },
      },
      status: 'authenticated',
    });

    render(
      <RoleGuard 
        allowedRoles={[UserRole.ADMIN]} 
        fallback={<div>Access Denied</div>}
      >
        <div>Protected Content</div>
      </RoleGuard>
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders nothing when user is not authenticated', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(
      <RoleGuard allowedRoles={[UserRole.ADMIN]}>
        <div>Protected Content</div>
      </RoleGuard>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
