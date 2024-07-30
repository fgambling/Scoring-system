"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { UserContextProvider } from "@/context/UserContext";
import { SnackbarProvider } from "@/context/SnackbarContext";
import { ModalProvider } from "@/context/ModalContext";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserContextProvider>
          <SnackbarProvider>
            <ModalProvider>{children}</ModalProvider>
          </SnackbarProvider>
        </UserContextProvider>
      </body>
    </html>
  );
}
