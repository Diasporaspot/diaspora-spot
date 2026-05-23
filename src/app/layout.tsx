import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const poppins = localFont({
  src: [
    { path: "../../public/fonts/Poppins-Light.ttf",          weight: "300", style: "normal" },
    { path: "../../public/fonts/Poppins-LightItalic.ttf",    weight: "300", style: "italic" },
    { path: "../../public/fonts/Poppins-Regular.ttf",        weight: "400", style: "normal" },
    { path: "../../public/fonts/Poppins-Italic.ttf",         weight: "400", style: "italic" },
    { path: "../../public/fonts/Poppins-Medium.ttf",         weight: "500", style: "normal" },
    { path: "../../public/fonts/Poppins-MediumItalic.ttf",   weight: "500", style: "italic" },
    { path: "../../public/fonts/Poppins-SemiBold.ttf",       weight: "600", style: "normal" },
    { path: "../../public/fonts/Poppins-SemiBoldItalic.ttf", weight: "600", style: "italic" },
    { path: "../../public/fonts/Poppins-Bold.ttf",           weight: "700", style: "normal" },
    { path: "../../public/fonts/Poppins-BoldItalic.ttf",     weight: "700", style: "italic" },
    { path: "../../public/fonts/Poppins-Black.ttf",          weight: "900", style: "normal" },
  ],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DiasporaSpot — Build your life abroad.",
  description: "DiasporaSpot is a digital hub created to help you build and grow your life abroad — with career resources, guides, and events.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={poppins.variable}>
      <body>{children}</body>
    </html>
  );
}
