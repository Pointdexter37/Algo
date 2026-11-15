import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import Providers from "@/components/Providers"
import AppHeader from "@/components/AppHeader"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://algo-olive-one.vercel.app"),
  title: {
    default: "AlgoPilot | Remember the patterns you solved",
    template: "%s | AlgoPilot",
  },
  description: "A spaced-review coding interview coach for Indian placement prep.",
  openGraph: {
    title: "AlgoPilot | Remember the patterns you solved",
    description: "Solve curated interview problems, then review them before the pattern fades.",
    url: "https://algo-olive-one.vercel.app",
    siteName: "AlgoPilot",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AlgoPilot | Remember the patterns you solved",
    description: "Spaced-review coding interview practice for placement prep.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions)

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Providers session={session}>
          <AppHeader session={session} />
          {children}
        </Providers>
      </body>
    </html>
  );
}
