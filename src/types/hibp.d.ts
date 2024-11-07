declare module 'hibp' {
  export function pwnedPassword(password: string): Promise<number>;
  export function breach(account: string): Promise<any>;
  export function breaches(options?: any): Promise<any>;
  export function breachedAccount(account: string, options?: any): Promise<any>;
  export function search(account: string): Promise<any>;
} 