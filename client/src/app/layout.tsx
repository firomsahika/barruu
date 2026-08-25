import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "react-hot-toast";

import Providers from "./providers";

const archivo = localFont({
  src: "./fonts/Archivo-Variable.ttf",
  weight: "100 900",
  style: "normal",
  variable: "--font-archivo",
});

export const metadata: Metadata = {
  title: "Barruu - Afaan Oromo Literary Platform",
  description: "Barruu: Dhaabbata maxxansaa barruu fi aadaa Afaan Oromo. Walaloo, Durdurii, Asoosama, fi Sagalee.",
  keywords: ["Afaan Oromo", "Literature", "Poetry", "Walaloo", "Durdurii", "Asoosama"],
  openGraph: {
    title: "Barruu",
    description: "Afaan Oromo Literary & Creative Publishing Platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="om">
      <body className={`${archivo.variable} min-h-screen antialiased`}>
        <Providers>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#08090a',
                color: '#fff',
                borderRadius: '8px',
                fontSize: '14px',
              },
            }}
          />
          {children}
        </Providers>
      </body>
    </html>
  );
}