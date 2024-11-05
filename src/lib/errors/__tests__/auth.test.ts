describe('Auth Errors', () => {
  it('should handle rate limiting', async () => {
    const attempts = Array(6).fill(null).map(() => 
      AuthService.validateCredentials('test@example.com', 'wrong')
    );
    
    await expect(Promise.all(attempts))
      .rejects.toThrow(RateLimitError);
  });

  it('should handle account lockout', async () => {
    // Simulate failed attempts
    for (let i = 0; i < 5; i++) {
      await AuthService.validateCredentials('test@example.com', 'wrong');
    }

    await expect(
      AuthService.validateCredentials('test@example.com', 'correct')
    ).rejects.toThrow(AccountLockoutError);
  });
}); 