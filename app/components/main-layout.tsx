import Header from "../components/header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex-1 flex flex-col">
      <Header />
      <div className="flex-1 p-6">{children}</div>
    </main>
  );
}
