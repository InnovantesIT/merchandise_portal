import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/app/context/cartcontext";
const inter = Inter({ subsets: ["latin"] });
import "@fortawesome/fontawesome-free/css/all.min.css"; // Importing Font Awesome globally

export const metadata: Metadata = {
  title: "e-store",
  description: "Browse our products",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Link to the favicon */}
       

        <link rel="icon" href="/favicon.ico" />
        <title>e-store</title>
        <meta name="description" content="Shop our exclusive merchandise!" />
      </head>
      <body>
        <CartProvider>
          <header>
          </header>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
