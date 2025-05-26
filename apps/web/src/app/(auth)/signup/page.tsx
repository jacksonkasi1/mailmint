"use client"

import { useState } from "react"
import type React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { GalleryVerticalEnd, EyeIcon, EyeOffIcon, Loader2, CheckCircle2, Mail, User } from "lucide-react"
import { AppleIcon, GoogleIcon } from "@/components/icons"

// Shadcn UI Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"

// Utils
import { cn } from "@/lib/utils"

// Auth APIs and Context
import { useAuth } from "@/contexts/auth-context"
import { signupUser } from "@/api/auth"
import type { SignupRequest, ApiError } from "@/api/auth/types"
import { toast } from "sonner"

// Form validation schema for signup
const signupSchema = z.object({
    firstName: z.string()
        .min(1, "First name is required")
        .min(2, "First name must be at least 2 characters"),
    lastName: z.string()
        .min(1, "Last name is required")
        .min(2, "Last name must be at least 2 characters"),
    email: z.string()
        .email("Please enter a valid email address")
        .min(1, "Email is required"),
    password: z.string()
        .min(1, "Password is required")
        .min(8, "Password must be at least 8 characters")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
    confirmPassword: z.string()
        .min(1, "Please confirm your password"),
    termsAccepted: z.boolean()
        .refine(val => val === true, "You must accept the terms and conditions"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

type SignupFormData = z.infer<typeof signupSchema>

interface SignupPageProps extends React.ComponentPropsWithoutRef<"div"> { }

export default function SignupPage({ className, ...props }: SignupPageProps) {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    
    const router = useRouter()
    const { signUp, signInWithGoogle } = useAuth()

    const form = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: "",
            termsAccepted: false,
        },
        mode: "onChange", // Enable real-time validation
    })

    const onSubmit = async (data: SignupFormData) => {
        setIsLoading(true)
        try {
            // Step 1: Create user in Firebase
            const displayName = `${data.firstName} ${data.lastName}`
            await signUp(data.email, data.password, displayName)
            
            // Step 2: Send signup data to backend API
            const signupData: SignupRequest = {
                email: data.email,
                password: data.password,
                firstName: data.firstName,
                lastName: data.lastName,
            }
            
            const response = await signupUser(signupData)
            
            if (response.success) {
                toast.success("Account created successfully", {
                    description: "Welcome! Please check your email to verify your account.",
                })
                
                // Redirect to email verification page or dashboard
                router.push(`/verify-email?email=${encodeURIComponent(data.email)}`)
            } else {
                throw new Error(response.message || 'Signup failed')
            }
        } catch (error: any) {
            console.error("Signup error:", error)
            
            const errorMessage = error.message || 'An error occurred during signup'
            
            toast.error("Signup failed", {
                description: errorMessage,
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleSocialAuth = async (provider: 'apple' | 'google') => {
        setIsLoading(true)
        try {
            if (provider === 'google') {
                const user = await signInWithGoogle()
                
                // Get Firebase ID token and send to backend
                const idToken = await user.getIdToken()
                
                // Call backend API for social auth signup
                const response = await fetch('/api/auth/social', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        provider: 'google',
                        idToken: idToken,
                        isSignup: true
                    })
                })
                
                if (response.ok) {
                    toast.success("Account created successfully", {
                        description: "Welcome! Redirecting to dashboard...",
                    })
                    router.push('/dashboard')
                } else {
                    throw new Error('Social authentication failed')
                }
            } else {
                // Apple auth implementation would go here
                toast.success("Coming soon", {
                    description: "Apple Sign-In will be available soon.",
                })
            }
        } catch (error: any) {
            console.error(`${provider} auth error:`, error)
            toast.error("Authentication failed", {
                description: `Failed to sign up with ${provider}. Please try again.`,
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-min items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4 py-8">
            <div className={cn(
                "animate-in fade-in-0 zoom-in-95 w-full max-w-md space-y-8 duration-500",
                className
            )} {...props}>

                {/* Header Section */}
                <div className="flex flex-col items-center space-y-4">
                    <Link
                        href="/"
                        className="group flex flex-col items-center transition-all duration-200 hover:scale-105"
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20 transition-all duration-200 group-hover:bg-primary/20 group-hover:ring-primary/30">
                            <GalleryVerticalEnd className="h-7 w-7 text-primary" />
                        </div>
                        <span className="sr-only">Acme Inc.</span>
                    </Link>

                    <div className="text-center">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Create your account
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="font-medium text-primary underline-offset-4 transition-colors hover:underline focus:underline focus:outline-none"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Main Form */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium text-foreground">
                                            First Name
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    {...field}
                                                    placeholder="John"
                                                    className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                                    disabled={isLoading}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium text-foreground">
                                            Last Name
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Doe"
                                                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                                disabled={isLoading}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Email Field */}
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium text-foreground">
                                        Email
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                {...field}
                                                type="email"
                                                placeholder="john@example.com"
                                                className="pl-10 pr-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                                disabled={isLoading}
                                            />
                                            {form.getValues("email") && !form.formState.errors.email && (
                                                <CheckCircle2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />

                        {/* Password Field */}
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium text-foreground">
                                        Password
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                {...field}
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Create a strong password"
                                                className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                                disabled={isLoading}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowPassword(!showPassword)}
                                                disabled={isLoading}
                                            >
                                                {showPassword ? (
                                                    <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <EyeIcon className="h-4 w-4 text-muted-foreground" />
                                                )}
                                                <span className="sr-only">
                                                    {showPassword ? "Hide password" : "Show password"}
                                                </span>
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />

                        {/* Confirm Password Field */}
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium text-foreground">
                                        Confirm Password
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                {...field}
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="Confirm your password"
                                                className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                                disabled={isLoading}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                disabled={isLoading}
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <EyeIcon className="h-4 w-4 text-muted-foreground" />
                                                )}
                                                <span className="sr-only">
                                                    {showConfirmPassword ? "Hide password" : "Show password"}
                                                </span>
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />

                        {/* Terms Acceptance Checkbox */}
                        <FormField
                            control={form.control}
                            name="termsAccepted"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={isLoading}
                                            className="mt-0.5"
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel className="cursor-pointer text-sm font-normal text-foreground">
                                            I agree to the{" "}
                                            <Link
                                                href="/terms"
                                                className="font-medium text-primary underline-offset-4 transition-colors hover:underline focus:underline focus:outline-none"
                                            >
                                                Terms of Service
                                            </Link>{" "}
                                            and{" "}
                                            <Link
                                                href="/privacy"
                                                className="font-medium text-primary underline-offset-4 transition-colors hover:underline focus:underline focus:outline-none"
                                            >
                                                Privacy Policy
                                            </Link>
                                        </FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="h-11 w-full font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                            disabled={isLoading || !form.formState.isValid}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                "Create account"
                            )}
                        </Button>
                    </form>
                </Form>

                {/* Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                    </div>
                </div>

                {/* Social Auth Buttons */}
                <div className="grid grid-cols-2 gap-3">
                    <Button
                        variant="outline"
                        className="h-11 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                        onClick={() => handleSocialAuth('apple')}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <AppleIcon className="mr-2 h-4 w-4" />
                                Apple
                            </>
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        className="h-11 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                        onClick={() => handleSocialAuth('google')}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <GoogleIcon className="mr-2 h-4 w-4" />
                                Google
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}