'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Lock, Users, Database, LogOut } from 'lucide-react'

export default function SettingsPage() {
  return (
    <AppLayout>
      <main className="flex-1 px-4 md:px-6 py-6 space-y-6 max-w-5xl mx-auto">

        {/* Page Header */}
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Settings
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage system configuration and preferences
          </p>
        </div>

        {/* Security Settings */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              <CardTitle>Security</CardTitle>
            </div>
            <CardDescription>
              Manage security and access settings
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <Label className="text-foreground font-medium mb-3 block">
                Change Password
              </Label>

              <div className="space-y-3 max-w-md">
                <Input
                  type="password"
                  placeholder="Current password"
                  className="bg-input border-border"
                />
                <Input
                  type="password"
                  placeholder="New password"
                  className="bg-input border-border"
                />
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  className="bg-input border-border"
                />
                <Button className="w-full sm:w-auto bg-primary hover:bg-accent text-primary-foreground">
                  Update Password
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Database & Backup */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              <CardTitle>Database & Backup</CardTitle>
            </div>
            <CardDescription>
              Manage data backup and export
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <Label className="text-foreground font-medium mb-2 block">
                Last Backup
              </Label>
              <p className="text-sm text-muted-foreground">
                2024-02-28 at 02:30 AM
              </p>
            </div>

            <Separator className="bg-border" />

            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="w-full sm:w-auto bg-primary hover:bg-accent text-primary-foreground">
                Backup Now
              </Button>
              <Button
                variant="outline"
                className="w-full sm:w-auto text-foreground border-border"
              >
                Export Data
              </Button>
              <Button
                variant="outline"
                className="w-full sm:w-auto text-foreground border-border"
              >
                View Backups
              </Button>
            </div>

            <Separator className="bg-border" />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Enable automatic daily backups
              </p>
              <Switch defaultChecked className="data-[state=checked]:bg-primary" />
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible actions
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full text-destructive border-destructive/50 hover:bg-destructive/10 gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </CardContent>
        </Card>

      </main>
    </AppLayout>
  )
}