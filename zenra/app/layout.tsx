import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zenra — the invisible team that protects your energy",
  description:
    "Zenra is an invisible team of AI agents that protects your energy so you can actually show up for work, family, and life — instead of burning out.",
};

// Set theme before paint to avoid a flash.
const themeInit = `(function(){try{var t=localStorage.getItem('zenra-theme')||'light';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
