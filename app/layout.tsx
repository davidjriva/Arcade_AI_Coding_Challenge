export const metadata = {
  title: 'Arcade Flow Analysis',
  description: 'AI-Powered User Journey Insights',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
