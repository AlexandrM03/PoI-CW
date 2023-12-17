import Navigation from '../components/navigation';

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col bg-default-50 text-foreground min-h-screen">
      <Navigation />
      {children}
    </div>
  );
}
