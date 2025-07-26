import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "~/components/ui/button";

export default function HomePage() {
  return (
    <>
      <h1 className="mb-8 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-6xl leading-tight font-bold text-transparent md:text-8xl">
        T3 Drive
      </h1>
      <p className="mx-auto mb-12 max-w-2xl text-2xl leading-relaxed text-gray-400 md:text-3xl">
        Secure, fast, and easy file storage for the modern web
      </p>
      <form
        action={async () => {
          "use server";

          const session = await auth();

          if (!session.userId) {
            return redirect("/sign-in");
          }

          return redirect("/drive");
        }}
      >
        <Button
          size="lg"
          type="submit"
          className="rounded-lg border border-gray-600 bg-gray-700 px-8 py-4 text-lg font-semibold text-white transition-all duration-200 hover:scale-105 hover:bg-gray-600"
        >
          Get Started
        </Button>
      </form>
    </>
  );
}
