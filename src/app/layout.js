import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import BackToTop from '../components/BackToTop';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700'],
  variable: "--font-poppins",
  display: 'swap',
});

export const metadata = {
  title: "School Directory - Find and Add Schools Across India",
  description: "Discover and add schools with our comprehensive directory. Search by location, view school details, and contribute to our growing database of educational institutions.",
  keywords: "schools, education, directory, India, find schools, add schools, school search",
  authors: [{ name: "School Directory Team" }],
  openGraph: {
    title: "School Directory - Find and Add Schools Across India",
    description: "Comprehensive directory of schools across India",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="antialiased bg-gradient-to-br from-white via-blue-50 to-blue-100 min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-6 max-w-7xl">
          {children}
        </main>
        <BackToTop />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#f9fafb',
              borderRadius: '12px',
              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
            },
            success: {
              style: {
                background: '#059669',
              },
            },
            error: {
              style: {
                background: '#dc2626',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
