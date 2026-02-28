'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Package, BarChart3, LogOut, Settings } from 'lucide-react'

export function AppSidebar() {
  const pathname = usePathname()

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Package, label: 'Assets', href: '/assets' },
    { icon: BarChart3, label: 'Reports', href: '/reports' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ]

  return (
    <div className="flex flex-col h-screen w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      {/* Header */}
      <div className="flex items-center gap-3 p-6 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-semibold">
          IT
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-sm truncate">IT Asset Manager</h1>
          <p className="text-xs text-sidebar-foreground/70 truncate">Management System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        <button className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
        <p className="text-xs text-sidebar-foreground/50 px-4 py-2">v1.0.0</p>
      </div>
    </div>
  )
}
