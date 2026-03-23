import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import WhatsAppButton from "@/components/WhatsAppButton";
import { ToastProvider } from "@/components/Toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "TokDig — Toko Digital Product Terpercaya",
    template: "%s | TokDig",
  },
  description:
    "Platform toko online digital product terpercaya. AI Premium, VPS, Digital Account, Voucher Game, dan Jasa Web dengan harga terbaik dan garansi.",
  keywords: [
    "AI premium", "VPS murah", "digital account", "voucher game",
    "toko digital", "ChatGPT Plus", "Netflix premium", "Spotify premium",
    "produk digital murah", "toko online digital",
  ],
  authors: [{ name: "TokDig" }],
  creator: "TokDig",
  metadataBase: new URL("https://tokdig.com"),
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "TokDig",
    title: "TokDig — Toko Digital Product Terpercaya",
    description: "Platform toko online digital product terpercaya dengan harga terbaik dan garansi.",
  },
  twitter: {
    card: "summary_large_image",
    title: "TokDig — Toko Digital Product Terpercaya",
    description: "Platform toko online digital product terpercaya.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
        <WhatsAppButton />
      </body>
    </html>
  );
}
