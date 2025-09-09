"use client";
import { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ChefHat, LoaderIcon, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { forgotPasswordSchema } from "@/schemas";
import { toast } from "sonner";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const form = useForm<z.infer<typeof forgotPasswordSchema>>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    const { handleSubmit, register, formState: { errors }, reset } = form;

    const resetState = () => {
        setSuccess("");
        setError("");
    };

    const onSubmit = async (values: z.infer<typeof forgotPasswordSchema>) => {
        try {
            resetState();
            setLoading(true);

            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
                
            });
            console.log("Submitted values:", values);

            const data = await response.json();
            
            console.log("Response data:", data)
            if (!response.ok) {
                throw new Error(data.message || "Something went wrong");
            }

            setSuccess("Reset password link has been sent to your email");
            toast.success("Reset password link sent successfully");
            reset();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Something went wrong";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

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

            {/* Main Content */}
            <div className="relative h-screen flex justify-center">
                <div className="w-full lg:w-1/2 flex items-center justify-center px-6">
                    <div className="w-full max-w-md">
                        <Card className="bg-background/10 backdrop-blur-xl border-border/50 shadow-2xl animate-fade-in">
                            <CardHeader className="space-y-2 text-center pb-6">
                                {/* Logo */}
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
                                    Forgot your password?
                                </CardTitle>
                                <CardDescription className="text-gray-300">
                                    Enter your email address and we&apos;ll send you a link to reset your password
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
                                            <h3 className="text-lg font-semibold text-white">Check your email</h3>
                                            <p className="text-sm text-gray-300">{success}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            ) : (
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <CardContent className="space-y-6 px-6">
                                        {/* Error Message */}
                                        {error && (
                                            <div className="p-3 bg-destructive/20 border border-destructive/30 rounded-lg">
                                                <p className="text-sm text-destructive font-medium">{error}</p>
                                            </div>
                                        )}

                                        {/* Email Field */}
                                        <div className="space-y-3">
                                            <Label htmlFor="email" className="text-sm font-semibold text-gray-100">
                                                Email address
                                            </Label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-300" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="Enter your email"
                                                    {...register("email")}
                                                    className={cn(
                                                        "pl-12 h-12 text-base transition-all duration-200",
                                                        "bg-background/50 backdrop-blur-sm",
                                                        "border-border/60 focus:border-primary",
                                                        "focus:ring-2 focus:ring-primary/20",
                                                        "hover:border-primary/50",
                                                        errors.email && "border-destructive focus:border-destructive focus:ring-destructive/20"
                                                    )}
                                                    disabled={loading}
                                                />
                                            </div>
                                            {errors.email && (
                                                <p className="text-sm text-destructive animate-slide-up font-medium">
                                                    {errors.email.message}
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
                                                    <span className="text-gray-300">Sending...</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center space-x-2">
                                                    <Mail className="h-5 w-5 text-gray-300" />
                                                    <span className="text-gray-300">Send Reset Link</span>
                                                </div>
                                            )}
                                        </Button>
                                    </CardFooter>
                                </form>
                            )}

                            {/* Back to Login */}
                            <div className="px-6 pb-6">
                                <Link href="/signin">
                                    <Button
                                        variant="ghost"
                                        className="w-full text-gray-300 hover:text-white hover:bg-white/10"
                                        disabled={loading}
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
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