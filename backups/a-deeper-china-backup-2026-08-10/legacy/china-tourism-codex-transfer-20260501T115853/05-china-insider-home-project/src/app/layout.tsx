import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "A Deeper China",
  description: "China, Closely: See the unseen.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
