describe('Authentication Flow', () => {
  it('should handle complete auth flow', async () => {
    // Registration
    const registerResponse = await registerUser();
    expect(registerResponse.status).toBe(201);

    // Email Verification
    const verifyResponse = await verifyEmail(registerResponse.token);
    expect(verifyResponse.status).toBe(200);

    // Login
    const loginResponse = await loginUser();
    expect(loginResponse.status).toBe(200);

    // 2FA Setup if enabled
    if (loginResponse.requires2FA) {
      const twoFactorResponse = await complete2FA();
      expect(twoFactorResponse.status).toBe(200);
    }
  });
}); 