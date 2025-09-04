"use client";
// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
// import { signinSchema } from "@/schemas";
// import { signIn } from "@/lib/auth-client";
// import { toast } from "sonner";

// import { Eye, EyeOff, Lock, Mail, LoaderIcon } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import {
//     Card,
//     CardContent,
//     CardDescription,
//     CardFooter,
//     CardHeader,
//     CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { cn } from "@/lib/utils";

// export default function LoginPage() {
//     const [showPassword, setShowPassword] = useState(false);
//     const [loading, setLoading] = useState(false);

//     const form = useForm<z.infer<typeof signinSchema>>({
//         resolver: zodResolver(signinSchema),
//         defaultValues: {
//             email: "",
//             password: "",
//         },
//     });

//     const togglePasswordVisibility = () => {
//         setShowPassword((prev) => !prev);
//     };

//     const onSubmit = async (data: z.infer<typeof signinSchema>) => {
//         try {
//             setLoading(true);

//             const { email, password } = data;

//             const { error } = await signIn.email({
//                 email,
//                 password,
//                 callbackURL: "/dashboard",
//                 rememberMe: false,
//             });

//             if (error) {
//                 toast.error(error.message || "Login failed");
//                 return;
//             }

//             toast.success("Login successful");
//             window.location.href = "/dashboard";
//         } catch (err) {
//             if (err instanceof Error) {
//                 toast.error(err.message || "Something went wrong");
//             } else {
//                 toast.error("Something went wrong");
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">


//             {/* Background gradient overlay */}
//             <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10" />

//             <Card className="w-full max-w-md relative z-10 animate-fade-in shadow-lg border-border/50 backdrop-blur-sm">
//                 <CardHeader className="space-y-1 text-center">
//                     <div className="flex justify-center mb-4">
//                         <div className="p-3 rounded-full bg-primary/10 ring-8 ring-primary/5">
//                             <Lock className="h-6 w-6 text-primary" />
//                         </div>
//                     </div>
//                     <CardTitle className="text-2xl font-semibold text-foreground">
//                         Welcome back
//                     </CardTitle>
//                     <CardDescription className="text-muted-foreground">
//                         Sign in to your account to continue
//                     </CardDescription>
//                 </CardHeader>

//                 <form onSubmit={form.handleSubmit(onSubmit)}>
//                     <CardContent className="space-y-4">
//                         {/* Email */}
//                         <div className="space-y-2">
//                             <Label
//                                 htmlFor="email"
//                                 className="text-sm font-medium text-foreground"
//                             >
//                                 Email address
//                             </Label>
//                             <div className="relative">
//                                 <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                                 <Input
//                                     id="email"
//                                     type="email"
//                                     placeholder="Enter your email"
//                                     disabled={loading}
//                                     {...form.register("email")}
//                                     className={cn(
//                                         "pl-10 transition-all duration-200",
//                                         "focus:ring-2 focus:ring-ring focus:border-ring",
//                                         "hover:border-ring/50"
//                                     )}
//                                 />
//                             </div>
//                             {form.formState.errors.email && (
//                                 <p className="text-sm text-destructive animate-slide-up">
//                                     {form.formState.errors.email.message}
//                                 </p>
//                             )}
//                         </div>

//                         {/* Password */}
//                         <div className="space-y-2">
//                             <Label
//                                 htmlFor="password"
//                                 className="text-sm font-medium text-foreground"
//                             >
//                                 Password
//                             </Label>
//                             <div className="relative">
//                                 <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                                 <Input
//                                     id="password"
//                                     type={showPassword ? "text" : "password"}
//                                     placeholder="Enter your password"
//                                     disabled={loading}
//                                     {...form.register("password")}
//                                     className={cn(
//                                         "pl-10 pr-10 transition-all duration-200",
//                                         "focus:ring-2 focus:ring-ring focus:border-ring",
//                                         "hover:border-ring/50"
//                                     )}
//                                 />
//                                 <Button
//                                     type="button"
//                                     variant="ghost"
//                                     size="sm"
//                                     className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
//                                     onClick={togglePasswordVisibility}
//                                     disabled={loading}
//                                 >
//                                     {showPassword ? (
//                                         <EyeOff className="h-4 w-4 text-muted-foreground" />
//                                     ) : (
//                                         <Eye className="h-4 w-4 text-muted-foreground" />
//                                     )}
//                                 </Button>
//                             </div>
//                             {form.formState.errors.password && (
//                                 <p className="text-sm text-destructive animate-slide-up">
//                                     {form.formState.errors.password.message}
//                                 </p>
//                             )}
//                         </div>

//                         {/* Remember me + Forgot password */}
//                         <div className="flex items-center justify-between text-sm">
//                             <div className="flex items-center space-x-2">
//                                 <input
//                                     type="checkbox"
//                                     id="remember"
//                                     className="h-4 w-4 rounded border border-input bg-background text-primary focus:ring-2 focus:ring-ring"
//                                 />
//                                 <Label
//                                     htmlFor="remember"
//                                     className="text-muted-foreground cursor-pointer"
//                                 >
//                                     Remember me
//                                 </Label>
//                             </div>
//                             <Button
//                                 type="button"
//                                 variant="link"
//                                 size="sm"
//                                 className="p-0 h-auto font-normal text-primary hover:text-primary/80"
//                                 disabled={loading}
//                             >
//                                 Forgot password?
//                             </Button>
//                         </div>
//                     </CardContent>

//                     <CardFooter className="flex flex-col space-y-4">
//                         <Button
//                             type="submit"
//                             className="w-full h-11 font-medium transition-all duration-200 hover:shadow-md disabled:opacity-50"
//                             disabled={loading}
//                         >
//                             {loading ? (
//                                 <div className="flex items-center justify-center space-x-2">
//                                     <LoaderIcon className="w-4 h-4 animate-spin" /> 
//                                     <span>Signing in...</span>
//                                 </div>
//                             ) : (
//                                 "Sign in"
//                             )}
//                         </Button>
//                     </CardFooter>
//                 </form>
//             </Card>
//         </div>
//     );
// }


import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, ChefHat, Mail, Lock,LoaderIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { cn } from "@/lib/utils";
import { signinSchema } from "@/schemas";
import { signIn } from "@/lib/auth-client";
import { toast } from "sonner";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<z.infer<typeof signinSchema>>({
        resolver: zodResolver(signinSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const { handleSubmit, register, formState: { errors, isSubmitting } } = form;

    const onSubmit = async (data: z.infer<typeof signinSchema>) => {
        try {
            const { email, password } = data;

            const { error } = await signIn.email({
                email,
                password,
                callbackURL: "/dashboard",

            });

            if (error) {
                toast.error(error.message || "Login failed");
                return;
            }

            toast.success("Login successful");
            // Redirect to dashboard
            window.location.href = "/dashboard";
        } catch (err) {
            if (err instanceof Error) {
                toast.error(err.message || "Something went wrong");
            } else {
                toast.error("Something went wrong");
            }
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="h-screen relative overflow-hidden ">
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: `url('https://images.pexels.com/photos/1449773/pexels-photo-1449773.jpeg')`,
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
                {/* Login Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center px-6">
                    <div className="w-full max-w-md">
                        <Card className="bg-background/10 backdrop-blur-xl border-border/50 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
                            <CardHeader className="space-y-2 text-center pb-6">
                                {/* Logo */}
                                <div className="flex justify-center mb-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-3 bg-primary rounded-xl">
                                            <ChefHat className="h-6 w-6 text-gray-100" />
                                        </div>
                                        <div>
                                            <h1 className="text-xl font-bold text-gray-100">Login</h1>
                                        </div>
                                    </div>
                                </div>

                                <CardTitle className="text-2xl font-bold text-white">
                                    Welcome back
                                </CardTitle>
                                <CardDescription className=" text-gray-300">
                                    Sign in to your restaurant dashboard
                                </CardDescription>
                            </CardHeader>

                            <form onSubmit={handleSubmit(onSubmit)}>
                                <CardContent className="space-y-6 px-6">
                                    {/* Email Field */}
                                    <div className="space-y-3">
                                        <Label htmlFor="email" className="text-sm font-semibold text-gray-100">
                                            Email address
                                        </Label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5  text-gray-300" />
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
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="text-sm text-destructive animate-slide-up font-medium">
                                                {errors.email.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Password Field */}
                                    <div className="space-y-3">
                                        <Label htmlFor="password" className="text-sm font-semibold text-gray-100">
                                            Password
                                        </Label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5  text-gray-300" />
                                            <Input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Enter your password"
                                                {...register("password")}
                                                className={cn(
                                                    "pl-12 pr-12 h-12 text-base transition-all duration-200",
                                                    "bg-background/50 backdrop-blur-sm",
                                                    "border-border/60 focus:border-primary",
                                                    "focus:ring-2 focus:ring-primary/20",
                                                    "hover:border-primary/50",
                                                    errors.password && "border-destructive focus:border-destructive focus:ring-destructive/20"
                                                )}
                                                disabled={isSubmitting}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted/50"
                                                onClick={togglePasswordVisibility}
                                                disabled={isSubmitting}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                                                ) : (
                                                    <Eye className="h-5 w-5 text-muted-foreground" />
                                                )}
                                            </Button>
                                        </div>
                                        {errors.password && (
                                            <p className="text-sm text-destructive animate-slide-up font-medium">
                                                {errors.password.message}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                id="rememberMe"
                                                // {...register("rememberMe")}
                                                className="h-4 w-4 rounded border-2 border-border bg-background text-primary focus:ring-2 focus:ring-primary/20 accent-primary"
                                                disabled={isSubmitting}
                                            />
                                            <Label htmlFor="rememberMe" className="text-sm text-gray-300 cursor-pointer font-medium">
                                                Remember me
                                            </Label>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="link"
                                            size="sm"
                                            className="p-0 h-auto text-sm font-semibold text-primary hover:text-primary/80 hover:underline"
                                            disabled={isSubmitting}
                                        >
                                            Forgot password?
                                        </Button>
                                    </div>
                                </CardContent>

                                <CardFooter className="flex flex-col space-y-6 px-6 pt-4 pb-6">
                                    <Button
                                        type="submit"
                                        className="w-full h-12 text-base font-semibold transition-all duration-200 hover:shadow-xl disabled:opacity-50 bg-primary text-black hover:bg-primary/90"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center space-x-3">
                                                 <LoaderIcon className="w-4 h-4 animate-spin text-gray-100" /> 
                                                <span className="text-gray-300">Signing in...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center space-x-2">
                                                <ChefHat className="h-5 w-5 text-gray-300" />
                                                <span className="text-gray-300">Sign in to Dashboard</span>
                                            </div>
                                        )}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>


                    </div>
                </div>
            </div>
        </div>
    );
}

