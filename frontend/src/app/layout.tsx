import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ['latin', 'vietnamese'] });

export const metadata: Metadata = {
  title: "BscXau - Đầu tư & Kiếm tiền",
  description: "Nền tảng đầu tư và kiếm tiền trực tuyến hàng đầu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <AuthProvider>
          <div className="mobile-container">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
