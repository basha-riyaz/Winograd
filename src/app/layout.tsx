"use client";
import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from './providers'
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { ErrorProvider } from '@/hooks/useErrorContext';
// If you are using 'sonner' or another toast library, import Toaster from there instead:
//import { Toaster } from 'sonner';
// Or, if you have a custom Toaster component, ensure it is exported as a React component:
import { Toaster } from '@/components/ui/toaster';
//! added by niranjan for theme toggle
import { ThemeToggle } from '@/components/ui/theme-toggler';

const inter = Inter({ subsets: ['latin'] })


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Winograd</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      </head>

      <body className={`${inter.className} min-h-screen antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <ErrorProvider>

              <div>
                <main className="flex min-h-screen flex-col">
                  {children}
                </main>
              </div>

              {/* Footer */}
              <div className="w-full text-center text-sm text-gray-500 p-4 shadow-md rounded-xl font-sans bg-white">
                <p className="mb-1">
                  Revenue generation | Cost of compliance | Total Cost of Ownership | Avg. test time / SSAI cycle
                </p>
                <p>
                  &copy; {new Date().getFullYear()} Winograd Inc. | Empowering AI Assurance
                </p>
              </div>
            </ErrorProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}