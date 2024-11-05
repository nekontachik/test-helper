export interface PublicKeyCredentialCreationOptionsJSON {
  challenge: string;
  rp: {
    name: string;
    id: string;
  };
  user: {
    id: string;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: {
    alg: number;
    type: 'public-key';
  }[];
  timeout?: number;
  attestation?: 'none' | 'indirect' | 'direct';
  authenticatorSelection?: {
    authenticatorAttachment?: 'platform' | 'cross-platform';
    residentKey?: 'discouraged' | 'preferred' | 'required';
    userVerification?: 'discouraged' | 'preferred' | 'required';
  };
}

export interface PublicKeyCredentialRequestOptionsJSON {
  challenge: string;
  allowCredentials?: {
    id: string;
    type: 'public-key';
    transports?: AuthenticatorTransport[];
  }[];
  timeout?: number;
  userVerification?: 'discouraged' | 'preferred' | 'required';
  rpId?: string;
}

export type AuthenticatorTransport = 'ble' | 'internal' | 'nfc' | 'usb';

export interface AuthenticatorDevice {
  credentialID: string;
  publicKey: string;
  counter: number;
  transports?: AuthenticatorTransport[];
} 