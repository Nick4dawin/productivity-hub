import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { fontSans } from "@/lib/fonts";
import { Toaster } from "@/components/ui/toaster";
import { CoachButton } from "@/components/coach-button";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Life OS",
  description: "Your personal operating system for life management.",
  manifest: "/manifest.json",
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
        suppressHydrationWarning
      >
        <AuthProvider>
          <Providers>
            <div className="relative flex min-h-screen flex-col">
              <div className="flex-1">{children}</div>
            </div>
            <Toaster />
            <CoachButton />
            <PWAInstallPrompt />
          </Providers>
        </AuthProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register(new URL('/service-worker.js', location.origin).href)
                    .then(registration => {
                      console.log('Service Worker registered: ', registration);
                    })
                    .catch(error => {
                      console.error('Service Worker registration failed: ', error);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
