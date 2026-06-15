import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Summer Kickoff Poster Studio",
  description: "A whimsical chibi football poster generator mini-app.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
