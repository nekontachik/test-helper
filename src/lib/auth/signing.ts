import { createHmac, timingSafeEqual } from 'crypto';

interface SignedRequest {
  timestamp: number;
  signature: string;
  body: string;
}

export class RequestSigning {
  private static readonly MAX_REQUEST_AGE = 5 * 60 * 1000; // 5 minutes
  private static readonly SIGNATURE_ALGORITHM = 'sha256';

  static signRequest(payload: any, apiKey: string): SignedRequest {
    const timestamp = Date.now();
    const body = JSON.stringify(payload);
    const signature = this.generateSignature(body, timestamp, apiKey);

    return {
      timestamp,
      signature,
      body,
    };
  }

  static verifyRequest(
    body: string,
    timestamp: number,
    signature: string,
    apiKey: string
  ): boolean {
    // Check request age
    if (Date.now() - timestamp > this.MAX_REQUEST_AGE) {
      return false;
    }

    const expectedSignature = this.generateSignature(body, timestamp, apiKey);
    return timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  private static generateSignature(
    body: string,
    timestamp: number,
    apiKey: string
  ): string {
    const hmac = createHmac(this.SIGNATURE_ALGORITHM, apiKey);
    hmac.update(`${timestamp}.${body}`);
    return hmac.digest('hex');
  }
} 