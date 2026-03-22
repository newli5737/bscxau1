export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0e27 0%, #0d1b3e 50%, #0a0e27 100%)',
      color: 'white',
    }}>
      {children}
    </div>
  );
}
