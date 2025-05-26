"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Mail, Loader2, GalleryVerticalEnd } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

export default function VerifyEmailPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { user, resendEmailVerification } = useAuth()
    const [isResending, setIsResending] = useState(false)
    const [isVerified, setIsVerified] = useState(false)

    const email = searchParams.get('email')

    // Check if user is verified
    useEffect(() => {
        if (user?.emailVerified) {
            setIsVerified(true)
            toast.success("Email verified successfully!", {
                description: "Your account has been activated. Redirecting to dashboard...",
            })
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
                router.push('/dashboard')
            }, 2000)
        }
    }, [user, router])

    const handleResendVerification = async () => {
        if (!user) {
            toast.error("No user found", {
                description: "Please sign in again to resend verification email.",
            })
            return
        }

        setIsResending(true)

        try {
            await resendEmailVerification()
            toast.success("Verification email sent!", {
                description: "Please check your inbox for the new verification link.",
            })
        } catch (error: any) {
            console.error('Resend verification error:', error)
            toast.error("Failed to resend email", {
                description: error.message || "Please try again later.",
            })
        } finally {
            setIsResending(false)
        }
    }

    if (isVerified) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4 py-8">
                <div className="animate-in fade-in-0 zoom-in-95 w-full max-w-md space-y-8 duration-500">
                    
                    {/* Header Section */}
                    <div className="flex flex-col items-center space-y-4">
                        <Link
                            href="/"
                            className="group flex flex-col items-center transition-all duration-200 hover:scale-105"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 ring-1 ring-green-500/20 transition-all duration-200 group-hover:bg-green-500/20 group-hover:ring-green-500/30">
                                <CheckCircle2 className="h-7 w-7 text-green-600 dark:text-green-400" />
                            </div>
                            <span className="sr-only">Acme Inc.</span>
                        </Link>

                        <div className="text-center">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                Email Verified!
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Your account has been successfully activated.
                            </p>
                        </div>
                    </div>

                    {/* Success Content */}
                    <div className="space-y-6">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-4">
                                Redirecting you to the dashboard...
                            </p>
                        </div>

                        <Button 
                            onClick={() => router.push('/dashboard')} 
                            className="h-11 w-full font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Go to Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4 py-8">
            <div className="animate-in fade-in-0 zoom-in-95 w-full max-w-md space-y-8 duration-500">
                
                {/* Header Section */}
                <div className="flex flex-col items-center space-y-4">
                    <Link
                        href="/"
                        className="group flex flex-col items-center transition-all duration-200 hover:scale-105"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20 transition-all duration-200 group-hover:bg-primary/20 group-hover:ring-primary/30">
                            <Mail className="h-7 w-7 text-primary" />
                        </div>
                        <span className="sr-only">Acme Inc.</span>
                    </Link>

                    <div className="text-center space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Verify Your Email
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {email ? (
                                <>We've sent a verification link to <span className="font-medium text-foreground">{email}</span></>
                            ) : (
                                "Please check your email for a verification link"
                            )}
                        </p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="space-y-6">
                    <div className="text-center space-y-3">
                        <p className="text-sm text-muted-foreground">
                            Click the verification link in your email to activate your account.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Didn't receive the email? Check your spam folder or request a new one.
                        </p>
                    </div>

                    <Button
                        onClick={handleResendVerification}
                        disabled={isResending}
                        variant="outline"
                        className="h-11 w-full font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {isResending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            "Resend Verification Email"
                        )}
                    </Button>

                    <div className="text-center">
                        <Link
                            href="/login"
                            className="text-sm font-medium text-primary underline-offset-4 transition-colors hover:underline focus:underline focus:outline-none"
                        >
                            Back to Login
                        </Link>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="text-center text-xs leading-relaxed text-muted-foreground">
                    Having trouble? Contact our{" "}
                    <Link
                        href="/support"
                        className="font-medium text-primary underline-offset-4 transition-colors hover:underline focus:underline focus:outline-none"
                    >
                        support team
                    </Link>{" "}
                    for assistance.
                </div>
            </div>
        </div>
    )
}