import { SignInButton } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <div className="mx-auto max-w-4xl text-center">
        <SignInButton forceRedirectUrl="/drive" />
      </div>
    </div>
  );
}
