'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Package,
  BarChart3,
  LogOut,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Package, label: 'Assets', href: '/assets' },
    { icon: BarChart3, label: 'Reports', href: '/reports' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ]

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })

      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Logout failed', error)
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">

        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-semibold">
            IT
          </div>

          {!collapsed && (
            <div>
              <h1 className="font-bold text-sm">IT Asset Manager</h1>
              <p className="text-xs text-sidebar-foreground/70">
                Management System
              </p>
            </div>
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-sidebar-accent"
        >
          {collapsed ? (
            <ChevronRight size={18} />
          ) : (
            <ChevronLeft size={18} />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className="w-5 h-5" />

              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Logout</span>}
        </button>

        {!collapsed && (
          <p className="text-xs text-sidebar-foreground/50 px-3">
            v1.0.0
          </p>
        )}
      </div>
    </div>
  )
}