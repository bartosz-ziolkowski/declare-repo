import "./globals.css";

import { DM_Sans } from "next/font/google";
import localFont from "next/font/local";
import MyProvider from "../utils/client/myProvider";
import GlobalLoadingError from "@/components/globalLoadingError";
import Footer from "@/components/footer";

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
  description: "Repository of Declare Models and Metrics",
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
            <main className={`${dmSans.variable} ${geistSans.variable} ${geistMono.variable} flex-grow antialiased font-sans`}>{children} </main> <Footer />{" "}
          </div>
        </MyProvider>
      </body>
    </html>
  );
}
