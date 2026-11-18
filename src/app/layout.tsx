import type { Metadata } from "next";
import "./globals.css";
import { auth } from "@/lib/auth";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "BloodBridge — Real-time Blood Donation Matching Platform",
  description:
    "Connecting people who urgently need blood with nearby verified volunteer donors in Kolkata and across India.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#FAFAFA] text-[#171717]">
        <Navbar user={session?.user} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
