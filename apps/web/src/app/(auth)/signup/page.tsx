"use client"

import { useState } from "react"
import type React from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { GalleryVerticalEnd, EyeIcon, EyeOffIcon, Loader2, CheckCircle2 } from "lucide-react"
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

// Utils
import { cn } from "@/lib/utils"

// Form validation schema
const signupSchema = z.object({
    fullName: z.string()
        .min(2, "Full name must be at least 2 characters")
        .max(50, "Full name must be less than 50 characters")
        .regex(/^[a-zA-Z\s]+$/, "Full name can only contain letters and spaces"),
    email: z.string()
        .email("Please enter a valid email address")
        .min(1, "Email is required"),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
    confirmPassword: z.string()
        .min(1, "Please confirm your password"),
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

    const form = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
        mode: "onChange", // Enable real-time validation
    })

    const onSubmit = async (data: SignupFormData) => {
        setIsLoading(true)
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000))
            console.log("Signup data:", data)
            // Handle successful signup
        } catch (error) {
            console.error("Signup error:", error)
            // Handle error
        } finally {
            setIsLoading(false)
        }
    }

    const handleSocialAuth = async (provider: 'apple' | 'google') => {
        setIsLoading(true)
        try {
            // Simulate social auth
            await new Promise(resolve => setTimeout(resolve, 1500))
            console.log(`${provider} auth initiated`)
        } catch (error) {
            console.error(`${provider} auth error:`, error)
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

                        {/* Full Name Field */}
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium text-foreground">
                                        Full Name
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                {...field}
                                                type="text"
                                                placeholder="John Doe"
                                                className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                                disabled={isLoading}
                                            />
                                            {form.getValues("fullName") && !form.formState.errors.fullName && (
                                                <CheckCircle2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />

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
                                            <Input
                                                {...field}
                                                type="email"
                                                placeholder="m@example.com"
                                                className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
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
                                                placeholder="Enter your password"
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

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="h-11 w-full font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                            disabled={isLoading || !form.formState.isValid}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                "Create Account"
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

                {/* Terms and Privacy */}
                <div className="text-center text-xs leading-relaxed text-muted-foreground">
                    By creating an account, you agree to our{" "}
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
                    .
                </div>
            </div>
        </div>
    )
}