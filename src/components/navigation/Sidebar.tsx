'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useTheme } from 'next-themes'
import {
  Home,
  BookOpen,
  Users,
  PlayCircle,
  Key,
  LayoutTemplate,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

import { Button } from '@/components/ui/button'

const navItems = [
  { label: 'Dashboard', icon: LayoutTemplate, href: '/tools' },
  { label: 'Configuration', icon: Home, href: '/tools/configuration' },
  { label: 'LLM Config', icon: Key, href: '/tools/agnetconfigs' },
  { label: 'Personas', icon: Users, href: '/tools/personas' },
  { label: 'Scenarios', icon: BookOpen, href: '/tools/test-cases' },
  { label: 'Test Runs', icon: PlayCircle, href: '/tools/runs' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { theme } = useTheme()

  return (
    <div className={`transition-all duration-300 ${collapsed ? 'w-16' : 'w-55'} border-r border-border bg-card shadow-sm h-screen flex flex-col`}>
      <div className="flex justify-end p-2"  style={{ borderBottom: '2px solid #f1f6f5' }}>
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>
      </div>
       

      <div className="flex-1 py-2 px-1">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} passHref>
              <div className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors
                  ${pathname === item.href ? 'bg-accent text-accent-foreground font-medium' : 'hover:bg-muted'}
                `}
              >
                <item.icon className="h-5 w-5 min-w-[20px]" />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </div>
            </Link>
          ))}
        </nav>
      </div>

      {!collapsed && (
        <div className="mt-auto px-3 py-2">
          <div className="border-t border-muted opacity-40"></div>
        </div>
      )}
    </div>
  )
}
