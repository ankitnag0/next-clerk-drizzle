export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1 flex items-center justify-center">
        {children}
      </main>
    </div>
  );
}
