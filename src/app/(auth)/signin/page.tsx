"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signinSchema } from "@/schemas";
import { z } from "zod";
import { useState } from "react";
import CardWrapper from "@/components/common/card-wrapper";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { signIn } from "@/lib/auth-client";

export default function Login() {
    const [loading, setLoading] = useState<boolean>(false);
    const form = useForm<z.infer<typeof signinSchema>>({
        resolver: zodResolver(signinSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    });

    // const onSubmit = async (formData: z.infer<typeof signinSchema>) => {
    //     console.log("Form submitted:", formData);
    //     const { email, password } = formData;
    //     const { error } = await signIn.email({
    //         email,
    //         password,
    //         callbackURL: "/dashboard",
    //         rememberMe: false
    //     }, {
    //         onRequest: () => {
    //             //show loading
    //             setLoading(true);
    //         },
    //         onSuccess: () => {
    //             // display the success message
    //             toast.success("Login successful");
    //             // redirect to dashboard
    //             window.location.href = "/dashboard";
    //             setLoading(false);
    //         },
    //         onError: () => {
    //             // display the error message
    //             toast.error(error?.message || "Login failed");
    //             setLoading(false);
    //         },
    //     })
    // };


    const onSubmit = async (formData: z.infer<typeof signinSchema>) => {
        try {
          setLoading(true);
          console.log("Form submitted:", formData);
      
          const { email, password } = formData;
      
          const { error } = await signIn.email({
            email,
            password,
            callbackURL: "/dashboard",
            rememberMe: false
          });
      
          if (error) {
            toast.error(error.message || "Login failed");
            return;
          }
      
          toast.success("Login successful");
          window.location.href = "/dashboard";
      
        } catch (err) {
          if (err instanceof Error) {
            toast.error(err.message || "Something went wrong");
          } else {
            toast.error("Something went wrong");
          }
        } finally {
          setLoading(false);
        }
      };      


    return (
        <CardWrapper
            title="Admin Login"
            description="Please enter your credentials to login"
            className="border-none bg-transparent shadow-none min-w-[500px]"
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 ">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="example@mail.com"
                                        {...field}
                                        disabled={loading}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="*********"
                                        {...field}
                                        type="password"
                                        disabled={loading}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button>Login</Button>
                </form>
            </Form>
        </CardWrapper>
    );
}