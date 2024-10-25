import { useSession } from "next-auth/react";
import { UserRole } from "@/types/auth";

export function usePermissions() {
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  return {
    canCreateProject: userRole === UserRole.ADMIN || userRole === UserRole.PROJECT_MANAGER,
    canEditProject: userRole === UserRole.ADMIN || userRole === UserRole.PROJECT_MANAGER,
    canDeleteProject: userRole === UserRole.ADMIN,
    canCreateTestCase: userRole === UserRole.TESTER || userRole === UserRole.ADMIN,
    canExecuteTestRun: userRole === UserRole.TESTER || userRole === UserRole.ADMIN,
    isAdmin: userRole === UserRole.ADMIN,
    isProjectManager: userRole === UserRole.PROJECT_MANAGER,
    isTester: userRole === UserRole.TESTER,
  };
}
