import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WHOOP Recovery Dashboard for TRMNL",
  description: "Track your WHOOP recovery metrics on your TRMNL e-ink display",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
