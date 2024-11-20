import { prisma } from '@/lib/prisma';
import { AuthenticationError } from '@/lib/errors';
import type { 
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  AuthenticatorTransport,
  AuthenticatorDevice
} from '@/types/webauthn';
import type { WebAuthnCredential } from '@prisma/client';

interface WebAuthnOptions {
  rpName: string;
  rpID: string;
  timeout: number;
  attestationType: 'none' | 'indirect' | 'direct';
  authenticatorSelection: {
    residentKey: 'discouraged' | 'preferred' | 'required';
    userVerification?: 'discouraged' | 'preferred' | 'required';
  };
}

/**
 * Service for handling WebAuthn authentication operations
 */
export class WebAuthnService {
  private static readonly DEFAULT_TIMEOUT = 60000; // 1 minute
  private static readonly DEFAULT_OPTIONS: WebAuthnOptions = {
    rpName: process.env.WEBAUTHN_RP_NAME!,
    rpID: process.env.WEBAUTHN_RP_ID!,
    timeout: 60000,
    attestationType: 'none',
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred'
    }
  };

  /**
   * Generates authentication options for WebAuthn registration
   * @param userId - User ID to generate options for
   * @returns Promise with authentication options
   */
  static async generateAuthenticationOptions(
    userId: string
  ): Promise<PublicKeyCredentialRequestOptionsJSON> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          email: true,
          webAuthnCredentials: {
            select: {
              credentialID: true,
              transportsData: true
            }
          }
        }
      });

      if (!user) {
        throw new AuthenticationError('User not found');
      }

      const challenge = crypto.randomUUID();

      const options: PublicKeyCredentialRequestOptionsJSON = {
        ...this.DEFAULT_OPTIONS,
        challenge,
        allowCredentials: user.webAuthnCredentials.map(cred => ({
          id: cred.credentialID,
          type: 'public-key',
          transports: JSON.parse(cred.transportsData) as AuthenticatorTransport[]
        })),
        rpId: process.env.WEBAUTHN_RP_ID!,
        timeout: this.DEFAULT_TIMEOUT,
        userVerification: 'preferred'
      };

      // Store challenge for verification
      await prisma.user.update({
        where: { id: userId },
        data: { currentChallenge: challenge }
      });

      return options;
    } catch (error) {
      console.error('Failed to generate authentication options:', error);
      throw new AuthenticationError('Failed to generate authentication options');
    }
  }

  /**
   * Verifies and stores WebAuthn authentication
   * @param userId - User ID to verify authentication for
   * @param credential - WebAuthn credential to verify
   * @returns Promise with verified credential
   */
  static async verifyAuthentication(
    userId: string,
    credential: AuthenticatorDevice
  ): Promise<WebAuthnCredential> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { currentChallenge: true }
      });

      if (!user?.currentChallenge) {
        throw new AuthenticationError('No authentication challenge found');
      }

      // Create credential record
      const webAuthnCredential = await prisma.webAuthnCredential.create({
        data: {
          userId,
          credentialID: credential.credentialID,
          credentialPublicKey: credential.publicKey,
          counter: credential.counter,
          transportsData: JSON.stringify(credential.transports || []),
          lastUsed: new Date()
        }
      });

      // Clear challenge after successful verification
      await prisma.user.update({
        where: { id: userId },
        data: { currentChallenge: null }
      });

      return webAuthnCredential;
    } catch (error) {
      console.error('Failed to verify authentication:', error);
      throw new AuthenticationError('Failed to verify authentication');
    }
  }

  /**
   * Updates the counter for a WebAuthn credential
   * @param credentialId - ID of credential to update
   * @param newCounter - New counter value
   */
  static async updateCredentialCounter(
    credentialId: string,
    newCounter: number
  ): Promise<void> {
    try {
      await prisma.webAuthnCredential.update({
        where: { id: credentialId },
        data: {
          counter: newCounter,
          lastUsed: new Date()
        }
      });
    } catch (error) {
      console.error('Failed to update credential counter:', error);
      throw new AuthenticationError('Failed to update credential');
    }
  }
} 