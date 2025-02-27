declare module 'hibp' {
  export function pwnedPassword(password: string): Promise<number>;
  
  export interface BreachData {
    Name: string;
    Title: string;
    Domain: string;
    BreachDate: string;
    AddedDate: string;
    ModifiedDate: string;
    PwnCount: number;
    Description: string;
    LogoPath: string;
    DataClasses: string[];
    IsVerified: boolean;
    IsFabricated: boolean;
    IsSensitive: boolean;
    IsRetired: boolean;
    IsSpamList: boolean;
  }
  
  export interface BreachOptions {
    domain?: string;
    includeUnverified?: boolean;
  }
  
  export function breach(account: string): Promise<BreachData | null>;
  export function breaches(options?: BreachOptions): Promise<BreachData[]>;
  export function breachedAccount(account: string, options?: BreachOptions): Promise<BreachData[]>;
  export function search(account: string): Promise<BreachData[]>;
} 