import type { Metadata } from "next";
import { Newsreader, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  style: ["normal", "italic"],
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-sans",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-mono",
});

export const metadata: Metadata = {
  title: "Wire — a live social feed",
  description: "Post, follow, and watch the feed update in real time.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${newsreader.variable} ${plexSans.variable} ${plexMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
