export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <div className="w-[80vw] h-[75vh] rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-2xl overflow-hidden">
        {children}
      </div>
    </div>
  );
}