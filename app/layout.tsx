import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Product Case Studies — Xavi Marín",
  description:
    "Interactive product case studies demonstrating how I approach API design and stakeholder trade-offs as a Product Owner.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased text-neutral-900 bg-white">
        {children}
      </body>
    </html>
  );
}
