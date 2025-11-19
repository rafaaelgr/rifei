import type { Metadata } from "next";
import { Sofia_Sans, Plus_Jakarta_Sans } from "next/font/google";
import { ClientLayout } from "@/components/ClientLayout";
import "./globals.css";

const sofiaSans = Sofia_Sans({
  variable: "--font-sofia",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Joia Raras Ações | Loja de Pipa + Iphone 17 ou 25k no PIX",
  description: "Ação da Loja de Pipa + Iphone 17 ou 25k no PIX",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${sofiaSans.variable} ${plusJakartaSans.variable} antialiased`}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
