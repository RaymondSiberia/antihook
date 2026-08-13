import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "АнтиКрючок — тест на устойчивость к вербовке",
  description: "12 ситуаций, которые проверят, умеете ли вы распознавать давление, опасные просьбы и попытки вовлечения.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
