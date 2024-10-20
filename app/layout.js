import "./globals.css";

import { Analytics } from '@vercel/analytics/react';
import { DM_Sans } from "next/font/google";
import Footer from "@/components/footer";
import GlobalLoadingError from "@/components/globalLoadingError";
import MyProvider from "../utils/client/myProvider";
import localFont from "next/font/local";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "700"],
});

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Declare Repository",
  description:
    "Repository of Declarative Process Models and Metrics | Database of Declarative Models | Dataset of Declare Models | Declarative Business Process Models",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        <MyProvider>
          {" "}
          <GlobalLoadingError />{" "}
          <div className="flex flex-col min-h-screen">
            <main
              className={`${dmSans.variable} ${geistSans.variable} ${geistMono.variable} flex-grow antialiased font-sans`}
            >
              {children}{" "}
               <Analytics />
            </main>{" "}
            <Footer />{" "}
          </div>
        </MyProvider>
      </body>
    </html>
  );
}
