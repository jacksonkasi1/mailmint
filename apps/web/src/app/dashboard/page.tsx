"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import { LogOut } from 'lucide-react'
import { toast } from 'sonner'

export default function DashboardPage() {
  const { user, logout, loading } = useAuth()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      toast.success("Logged out successfully", {
        description: "See you next time!",
      })
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error("Logout failed", {
        description: "There was an error logging you out. Please try again.",
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  // Don't render anything if user is not authenticated (will redirect)
  if (!user) {
    return null
  }

  // Get user initials for avatar fallback
  const getInitials = (name: string | null) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Header with profile and logout */}
          <div className="flex items-center justify-between mb-8">
            {/* Left side - Dashboard title */}
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Dashboard
            </h1>
            
            {/* Right side - Profile and logout */}
            <div className="flex items-center gap-4">
              {/* Profile section */}
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {getInitials(user.displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    {user.displayName || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>
              
              {/* Logout button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </Button>
            </div>
          </div>

          {/* Main content area - You can add your dashboard content here */}
          <div className="text-center text-muted-foreground">
            <p>Welcome to your dashboard!</p>
          </div>
          
        </div>
      </div>
    </div>
  )
}