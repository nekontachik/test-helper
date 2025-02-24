import { withRoleCheck } from '@/components/auth/withRoleCheck';
import { Action, Resource } from '@/lib/auth/rbac/types';
import { TestCaseList } from '@/components/TestCaseList';

function TestCasesPage({ params }: { params: { projectId: string } }) {
  return (
    <div>
      <TestCaseList projectId={params.projectId} />
    </div>
  );
}

export default withRoleCheck(TestCasesPage, {
  action: Action.READ,
  resource: Resource.TEST_CASE,
}); 