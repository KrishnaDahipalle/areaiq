import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AreaIQ - Hyderabad Relocation Intelligence",
  description: "Scalable Multi-Criteria Decision Analysis Relocation Engine Matrix Core",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-slate-950 text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}