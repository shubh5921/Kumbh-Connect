import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, Lock, Mail, KeyRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForgetPasswordMutation, useSendVerifyCodeMutation } from "@/slices/authApiSlice";
import { toast } from "@/components/ui/use-toast";

const forgetPassSchema = z.object({
    email: z
        .string()
        .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, { message: "Invalid Email Address." }),
        password: z.
        string({required_error:"Password is Required."})
        .regex(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])(.{8,})$/, {message:"Password must be at least 8 characters long, include an uppercase letter and a special character"}),
    verifyCode: z
            .string({ required_error: "Verification Code is required" })
            .length(6, { message: "Verification Code must be of 6 length." }),
});

export default function ForgetPasswordPage() {
    const navigate = useNavigate();
    const [forgetPassword, { isLoading }] = useForgetPasswordMutation();
    const [sendVerifyCode] = useSendVerifyCodeMutation();

    const [isCodeSent, setIsCodeSent] = useState(false);
    const [isSendingCode, setIsSendingCode] = useState(false);
    const [timer, setTimer] = useState(0);

    const form = useForm({
        resolver: zodResolver(forgetPassSchema),
        defaultValues: {
            email: "",
            password: "",
            verifyCode: "",
        },
    });

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    async function onSubmit(data) {
        try {
            const res = await forgetPassword(data).unwrap();
            if (res.success) {
                toast({
                    title: "Success!",
                    description: "Your password has been updated successfully.",
                });
                navigate('/accounts/sign-in', { replace: true });
            } else {
                toast({
                    title: "Error",
                    description: res.message,
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error?.data?.message || "An unexpected error occurred.",
                variant: "destructive",
            });
        }
    }

    const handleSendCode = async () => {
        const email = form.getValues("email");
        if (!email) {
            toast({
                title: "Error",
                description: "Please enter your email before sending the code.",
                variant: "destructive",
            });
            return;
        }
        try {
            setIsSendingCode(true);
            const res = await sendVerifyCode({ email }).unwrap();
            if (res.success) {
                setIsCodeSent(true);
                setTimer(60);
                toast({
                    title: "Code Sent!",
                    description: "Please check your email for the verification code.",
                });
            } else {
                toast({
                    title: "Error",
                    description: res.message || "An unexpected error occurred.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error?.data?.message || "An unexpected error occurred.",
                variant: "destructive",
            });
        } finally {
            setIsSendingCode(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl text-center font-bold">Reset Password</CardTitle>
                    <CardDescription className="text-center">
                        Enter your email to reset your password
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                                <Input
                                                    type="email"
                                                    placeholder="Enter your email"
                                                    className="pl-10"
                                                    {...field}
                                                />
                                            </div>
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
                                        <FormLabel>New Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                                <Input
                                                    type="password"
                                                    placeholder="Enter new password"
                                                    className="pl-10"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="space-y-2">
                                <FormField
                                    control={form.control}
                                    name="verifyCode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Verification Code</FormLabel>
                                            <div className="flex space-x-2">
                                                <FormControl>
                                                    <div className="relative flex-1">
                                                        <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                                        <Input
                                                            type="text"
                                                            disabled={!isCodeSent}
                                                            placeholder="Enter 6-digit code"
                                                            className="pl-10"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleSendCode}
                                                    disabled={timer > 0 || isSendingCode}
                                                    className="w-32"
                                                >
                                                    {isSendingCode ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : timer > 0 ? (
                                                        `${timer}s`
                                                    ) : (
                                                        "Send Code"
                                                    )}
                                                </Button>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button
                                className="w-full"
                                type="submit"
                                disabled={!isCodeSent || isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                        Resetting Password
                                    </>
                                ) : (
                                    "Reset Password"
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <div className="text-sm text-center text-gray-500">
                        Remember your password?{' '}
                        <Link to="/accounts/sign-in" className="font-medium text-primary hover:underline">
                            Sign in
                        </Link>
                    </div>
                    <div className="text-sm text-center text-gray-500">
                        Don't have an account?{' '}
                        <Link to="/accounts/sign-up" className="font-medium text-primary hover:underline">
                            Sign up
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}