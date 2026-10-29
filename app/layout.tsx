import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MINDTRACE",
  description:
    "Investigate reading barriers with evidence, try a support, and verify what helped.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
