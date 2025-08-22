"use client"

import Sidebar from '@/components/navigation/Sidebar'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation';
export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors">

      <header className="w-full px-4 border-b border-border bg-card flex items-center justify-between " >
        <div className="flex items-center gap-4">
          {/* <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded hover:bg-gray-200 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button> */}
          <button
            onClick={() => router.push('/')}>   
            <img
              src="/android_logo.png"
              alt="Winograd Logo"
              className="h-14 cursor-pointer"
              title = "WINOGRAD - Trust Every Move Your AI Makes"
            />
          </button>

          {/* <img src="/winograd_logo.png" alt="Winograd Logo" className="h-10"/>  */}
          <span className="text-xs text-muted-foreground uppercase tracking-wider border-l border-muted pl-2">
            Agent Testing Framework
          </span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className=" border-r border-border">
          <Sidebar />
        </aside>
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </div>
  )
}