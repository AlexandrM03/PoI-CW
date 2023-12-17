export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-default">
      <div className="p-8 w-1/4 rounded-xl shadow-lg border bg-default-100 text-foreground">
        {children}
      </div>
    </div>
  );
}
