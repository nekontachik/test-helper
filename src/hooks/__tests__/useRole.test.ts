import { renderHook } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRole } from '../useRole';
import { UserRole } from '@/types/auth';

jest.mock('next-auth/react');

describe('useRole', () => {
  const mockUseSession = useSession as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns correct role checks for authenticated user', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          role: UserRole.ADMIN,
        },
      },
    });

    const { result } = renderHook(() => useRole());

    expect(result.current.isAdmin()).toBe(true);
    expect(result.current.isProjectManager()).toBe(false);
    expect(result.current.isTester()).toBe(false);
    expect(result.current.role).toBe(UserRole.ADMIN);
  });

  it('handles hasRole check with single role', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          role: UserRole.PROJECT_MANAGER,
        },
      },
    });

    const { result } = renderHook(() => useRole());

    expect(result.current.hasRole(UserRole.PROJECT_MANAGER)).toBe(true);
    expect(result.current.hasRole(UserRole.ADMIN)).toBe(false);
  });

  it('handles hasRole check with multiple roles', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          role: UserRole.TESTER,
        },
      },
    });

    const { result } = renderHook(() => useRole());

    expect(result.current.hasRole([UserRole.TESTER, UserRole.PROJECT_MANAGER])).toBe(true);
    expect(result.current.hasRole([UserRole.ADMIN, UserRole.PROJECT_MANAGER])).toBe(false);
  });

  it('returns false for all checks when user is not authenticated', () => {
    mockUseSession.mockReturnValue({
      data: null,
    });

    const { result } = renderHook(() => useRole());

    expect(result.current.isAdmin()).toBe(false);
    expect(result.current.isProjectManager()).toBe(false);
    expect(result.current.isTester()).toBe(false);
    expect(result.current.hasRole(UserRole.ADMIN)).toBe(false);
    expect(result.current.role).toBeUndefined();
  });
});
