"use client";

import { z } from "zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, ChefHat, Lock, LoaderIcon, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { resetPasswordFormSchema } from "@/schemas";
import { toast } from "sonner";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function ResetPasswordPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const form = useForm<z.infer<typeof resetPasswordFormSchema>>({
        resolver: zodResolver(resetPasswordFormSchema),
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
        },
    });

    const { handleSubmit, register, formState: { errors }, reset } = form;

    useEffect(() => {
        if (!token) {
            setError("Invalid or missing reset token");
        }
    }, [token]);

    const resetState = () => {
        setSuccess("");
        setError("");
    };

    const onSubmit = async (values: z.infer<typeof resetPasswordFormSchema>) => {
        try {
            resetState();
            setLoading(true);

            if (!token) {
                throw new Error("Reset token is missing");
            }

            const { data, error } = await authClient.resetPassword({
                newPassword: values.newPassword,
                token,
            });

            console.log("Reset password result:", { data, error });

            if (error) {
                throw new Error(error.message || "Something went wrong");
            }

            setSuccess("Password reset successfully! You can now sign in with your new password.");
            toast.success("Password reset successfully");
            reset();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Something went wrong";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    if (!token) {
        return (
            <div className="h-screen relative overflow-hidden">
                <div
                    className="absolute inset-0 z-0"
                    style={{
                        backgroundImage: `url('/images/auth-bg.webp')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }}
                >
                    <div className="absolute inset-0 bg-black/60 dark:bg-black/60" />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
                </div>

                <div className="relative h-screen flex justify-center">
                    <div className="w-full lg:w-1/2 flex items-center justify-center px-6">
                        <div className="w-full max-w-md">
                            <Card className="bg-background/10 backdrop-blur-xl border-border/50 shadow-2xl animate-fade-in">
                                <CardContent className="space-y-6 px-6 py-8">
                                    <div className="text-center space-y-4">
                                        <div className="flex justify-center">
                                            <div className="p-3 bg-destructive/20 rounded-full">
                                                <ChefHat className="h-12 w-12 text-destructive" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-semibold text-white">Invalid Reset Link</h3>
                                            <p className="text-sm text-gray-300">
                                                This password reset link is invalid or has expired. Please request a new one.
                                            </p>
                                        </div>
                                        <Link href="/forgot-password">
                                            <Button className="w-full mt-4">
                                                Request New Reset Link
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen relative overflow-hidden">
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: `url('/images/auth-bg.webp')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                <div className="absolute inset-0 bg-black/60 dark:bg-black/60" />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
            </div>

            <div className="relative h-screen flex justify-center">
                <div className="w-full lg:w-1/2 flex items-center justify-center px-6">
                    <div className="w-full max-w-md">
                        <Card className="bg-background/10 backdrop-blur-xl border-border/50 shadow-2xl animate-fade-in">
                            <CardHeader className="space-y-2 text-center pb-6">
                                <div className="flex justify-center mb-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-3 bg-primary rounded-xl">
                                            <ChefHat className="h-6 w-6 text-gray-100" />
                                        </div>
                                        <div>
                                            <h1 className="text-xl font-bold text-gray-100">Reset Password</h1>
                                        </div>
                                    </div>
                                </div>

                                <CardTitle className="text-2xl font-bold text-white">
                                    Create New Password
                                </CardTitle>
                                <CardDescription className="text-gray-300">
                                    Enter your new password below
                                </CardDescription>
                            </CardHeader>

                            {success ? (
                                <CardContent className="space-y-6 px-6">
                                    <div className="text-center space-y-4">
                                        <div className="flex justify-center">
                                            <div className="p-3 bg-green-500/20 rounded-full">
                                                <CheckCircle className="h-12 w-12 text-green-400" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-semibold text-white">Password Reset Successfully</h3>
                                            <p className="text-sm text-gray-300">{success}</p>
                                        </div>
                                        <Link href="/signin">
                                            <Button className="w-full mt-4">
                                                Sign In Now
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            ) : (
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <CardContent className="space-y-6 px-6">
                                        {error && (
                                            <div className="p-3 bg-destructive/20 border border-destructive/30 rounded-lg">
                                                <p className="text-sm text-destructive font-medium">{error}</p>
                                            </div>
                                        )}

                                        {/* Password Field */}
                                        <div className="space-y-3">
                                            <Label htmlFor="password" className="text-sm font-semibold text-gray-100">
                                                New Password
                                            </Label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-300" />
                                                <Input
                                                    id="password"
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Enter new password"
                                                    {...register("newPassword")}
                                                    className={cn(
                                                        "pl-12 pr-12 h-12 text-base transition-all duration-200",
                                                        "bg-background/50 backdrop-blur-sm",
                                                        "border-border/60 focus:border-primary",
                                                        "focus:ring-2 focus:ring-primary/20",
                                                        "hover:border-primary/50",
                                                        errors.newPassword && "border-destructive focus:border-destructive focus:ring-destructive/20"
                                                    )}
                                                    disabled={loading}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted/50"
                                                    onClick={togglePasswordVisibility}
                                                    disabled={loading}
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-5 w-5 text-muted-foreground" />
                                                    ) : (
                                                        <Eye className="h-5 w-5 text-muted-foreground" />
                                                    )}
                                                </Button>
                                            </div>
                                            {errors.newPassword && (
                                                <p className="text-sm text-destructive animate-slide-up font-medium">
                                                    {errors.newPassword.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* Confirm Password Field */}
                                        <div className="space-y-3">
                                            <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-100">
                                                Confirm New Password
                                            </Label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-300" />
                                                <Input
                                                    id="confirmPassword"
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    placeholder="Confirm new password"
                                                    {...register("confirmPassword")}
                                                    className={cn(
                                                        "pl-12 pr-12 h-12 text-base transition-all duration-200",
                                                        "bg-background/50 backdrop-blur-sm",
                                                        "border-border/60 focus:border-primary",
                                                        "focus:ring-2 focus:ring-primary/20",
                                                        "hover:border-primary/50",
                                                        errors.confirmPassword && "border-destructive focus:border-destructive focus:ring-destructive/20"
                                                    )}
                                                    disabled={loading}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted/50"
                                                    onClick={toggleConfirmPasswordVisibility}
                                                    disabled={loading}
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff className="h-5 w-5 text-muted-foreground" />
                                                    ) : (
                                                        <Eye className="h-5 w-5 text-muted-foreground" />
                                                    )}
                                                </Button>
                                            </div>
                                            {errors.confirmPassword && (
                                                <p className="text-sm text-destructive animate-slide-up font-medium">
                                                    {errors.confirmPassword.message as string}
                                                </p>
                                            )}
                                        </div>
                                    </CardContent>

                                    <CardFooter className="flex flex-col space-y-4 px-6 pt-4 pb-6">
                                        <Button
                                            type="submit"
                                            className="w-full h-12 text-base font-semibold transition-all duration-200 hover:shadow-xl disabled:opacity-50 bg-primary text-black hover:bg-primary/90"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <div className="flex items-center space-x-3">
                                                    <LoaderIcon className="w-4 h-4 animate-spin text-gray-100" />
                                                    <span className="text-gray-300">Resetting...</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center space-x-2">
                                                    <Lock className="h-5 w-5 text-gray-300" />
                                                    <span className="text-gray-300">Reset Password</span>
                                                </div>
                                            )}
                                        </Button>
                                    </CardFooter>
                                </form>
                            )}

                            <div className="px-6 pb-6">
                                <Link href="/signin">
                                    <Button
                                        variant="ghost"
                                        className="w-full text-gray-300 hover:text-white hover:bg-white/10"
                                        disabled={loading}
                                    >
                                        Back to Sign In
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}