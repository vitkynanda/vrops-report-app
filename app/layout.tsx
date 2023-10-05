import { ThemeProvider } from "@/providers/theme-providers";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { QueryProvider } from "@/providers/query-provider";
import { ModalProvider } from "@/providers/modal-providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BTN Vrops Report",
  description: "Develop for local usage",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            storageKey="discord-theme"
          >
            <ModalProvider />
            <Toaster />
            {children}
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
