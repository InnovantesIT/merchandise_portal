// RootLayout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/app/context/cartcontext";
import "@fortawesome/fontawesome-free/css/all.min.css"; // Importing Font Awesome globally
import AuthWrapper from "@/app/components/authwrapper"; // Adjust the path if needed

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "e-store",
  description: "Browse our products",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        {/* Link to the favicon */}
        <link rel="icon" href="/favicon.ico" />
        <title>e-store</title>
        <meta name="description" content="Shop our exclusive merchandise!" />
      </head>
      <body>
        <CartProvider>
          <AuthWrapper>
            <header>
              {/* Add your header content here if needed */}
            </header>
            {children}
          </AuthWrapper>
        </CartProvider>
      </body>
    </html>
  );
}
