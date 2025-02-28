import { redirect } from 'next/navigation';
import { RedirectType } from 'next/dist/client/components/redirect';

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}): never {
  // Get the callback URL if it exists
  const callbackUrl = searchParams?.callbackUrl 
    ? `?callbackUrl=${encodeURIComponent(searchParams.callbackUrl as string)}`
    : '';
  
  // Redirect to signin page with 308 status (permanent redirect)
  // This preserves any query parameters
  return redirect(`/auth/signin${callbackUrl}`, RedirectType.replace);
}
