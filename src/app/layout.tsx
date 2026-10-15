import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevHub — Developer Workspace",
  description: "Your all-in-one developer workspace: utilities, API notes, and AI assistance.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
