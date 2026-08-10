import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "A Deeper China — China, understood before you arrive.",
  description: "Editorial route direction and human-reviewed digital roadbooks for independent China travel.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

