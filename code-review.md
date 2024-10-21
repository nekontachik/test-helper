# Code Review Checklist

## General Checks

- [ ] Code adheres to project formatting standards
- [ ] No unused imports or variables
- [ ] Functions and variables have clear, descriptive names
- [ ] Complex parts of the code are commented

## Type Checking (TypeScript)

- [ ] All variables, function parameters, and return values have explicit types
- [ ] Appropriate interfaces are used for complex objects
- [ ] No use of `any` except where absolutely necessary
- [ ] Generics are used where appropriate

## Error Handling

- [ ] All potential errors are handled (try-catch blocks, null/undefined checks)
- [ ] Informative error messages are used
- [ ] Errors are logged or propagated as needed

## Functionality

- [ ] Function performs only one task (Single Responsibility Principle)
- [ ] No code duplication (DRY principle)
- [ ] Function has no side effects (unless intended by design)

## Performance

- [ ] No obvious performance issues (e.g., unnecessary loops)
- [ ] Large data objects are handled efficiently

## Security

- [ ] No sensitive information in the code (passwords, API keys)
- [ ] Input data is validated before use

## Testing

- [ ] Basic unit tests are written for the function
- [ ] Tests cover main usage scenarios
- [ ] Tests check edge cases and error handling

## Final Check

- [ ] Code compiles successfully without errors
- [ ] All automated checks (linter, types) pass
- [ ] Function integrates with the rest of the codebase without conflicts
