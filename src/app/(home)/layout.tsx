export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <div className="mx-auto max-w-4xl text-center">{children}</div>
    </div>
  );
}
