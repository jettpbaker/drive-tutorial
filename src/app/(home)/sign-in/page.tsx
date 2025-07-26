import { SignInButton } from "@clerk/nextjs";

export default function SignInPage() {
  return <SignInButton forceRedirectUrl="/drive" />;
}
