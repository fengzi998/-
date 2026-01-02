import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "医疗美容 AI 营销 SaaS",
  description: "AI-powered marketing platform for medical aesthetic industry",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
