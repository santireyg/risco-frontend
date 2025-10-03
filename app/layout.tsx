// app/layout.tsx
import type { Metadata } from "next";

import { Kumbh_Sans } from "next/font/google";
import "./globals.css";
import { HeroUIProvider } from "@heroui/system";

import { AuthProvider } from "./context/AuthContext";
import { WebSocketProvider } from "./context/WebSocketContext";

import NavBar from "@/components/NavBar";

const kumbhSans = Kumbh_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Risco IA | Caución",
  description: "Análisis de riesgos con IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={kumbhSans.className}>
        <AuthProvider>
          <WebSocketProvider>
            <HeroUIProvider>
              <NavBar />
              {children}
            </HeroUIProvider>
          </WebSocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
