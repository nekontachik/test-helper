# Batch Fixing Lint and TypeScript Issues

## Common Commands
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run type-check` - Check TypeScript types
- `tsc --noEmit` - Verify TypeScript without generating files

## Priority Order
1. Type Errors
   - Start with `src/types/` directory
   - Fix interface definitions first
   - Address missing type imports
   - Resolve generic type issues

2. ESLint Errors
   - Run auto-fix first
   - Address remaining errors by category:
     - Unused variables/imports
     - Missing dependencies in useEffect
     - Accessibility issues
     - Code style violations

3. Test Files
   - Fix type assertions in tests
   - Update outdated test patterns
   - Add missing type definitions for mocks

## Common Fixes
- Add proper type definitions
- Fix incorrect import paths
- Update deprecated patterns
- Remove unused code
- Add missing null checks
- Fix promise handling

## Verification
1. Run full test suite
2. Verify build process
3. Check runtime behavior
4. Review git diff for unintended changes

## Tools
- VSCode Problems panel
- TypeScript Language Server
- ESLint extension
- Git diff viewer
