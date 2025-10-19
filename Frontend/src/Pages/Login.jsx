import React from 'react';
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { Loader2, LockKeyhole, Mail } from "lucide-react"
import { useLoginMutation } from "@/slices/authApiSlice"
import { useDispatch } from "react-redux"
import { setCredentials } from "@/slices/authSlice"
import { toast } from "@/components/ui/use-toast"

const signInSchema = z.object({
    email: z
        .string()
        .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, { message: "Invalid Email Address." }),
        password: z.
            string({required_error:"Password is Required."})
            .regex(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])(.{8,})$/, {message:"Password must be at least 8 characters long, include an uppercase letter and a special character"})
})

export const LoginPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [login, { isLoading }] = useLoginMutation();

    const form = useForm({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    async function onSubmit(data) {
        try {
            const res = await login(data).unwrap();
            dispatch(setCredentials(res))
            if (res.success) {
                toast({
                    title: "Login Successful",
                });
                navigate('/menu',{replace:true})
            } else {
                toast({
                    title: "Login Failed",
                    description: res.message,
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Login Failed",
                description: error?.data?.message || "An unexpected error occurred.",
                variant: "destructive",
            });
        }
    }

    return (
        <div className="flex min-h-screen bg-white">
            <div className="hidden lg:flex lg:w-1/2 bg-black p-12 items-center justify-center relative overflow-hidden">
                <div className="relative z-10 text-white space-y-6">
                    <h1 className="text-4xl font-bold">Welcome Back!</h1>
                    <p className="text-lg text-gray-300">Sign in to continue your journey with us.</p>
                </div>
                
                <div className="absolute inset-0 opacity-10">
                    <svg viewBox="0 0 400 400" className="w-full h-full">
                        <circle cx="100" cy="100" r="80" fill="white" />
                        <circle cx="300" cy="300" r="120" fill="white" />
                        <path d="M100,200 Q200,100 300,200" stroke="white" fill="none" strokeWidth="40" />
                    </svg>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-bold text-black">Sign In</h2>
                        <p className="text-gray-600">Welcome back! Please enter your details.</p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700">Email</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                                                <Input 
                                                    type="text" 
                                                    placeholder="Enter your email" 
                                                    className="pl-10 bg-white border-gray-200 text-black placeholder:text-gray-400" 
                                                    {...field} 
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-red-500" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700">Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <LockKeyhole className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                                                <Input 
                                                    type="password" 
                                                    placeholder="Enter your password" 
                                                    className="pl-10 bg-white border-gray-200 text-black placeholder:text-gray-400" 
                                                    {...field} 
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage className="text-red-500" />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-4">
                                <div className="flex justify-end">
                                    <Link 
                                        to="/accounts/forget-password" 
                                        className="text-sm text-gray-600 hover:text-black"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>

                                <Button 
                                    className="w-full bg-black hover:bg-gray-900 text-white py-2 h-11" 
                                    type="submit" 
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="animate-spin mr-2" />
                                            Please Wait
                                        </>
                                    ) : (
                                        'Sign In'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>

                    <div className="text-center">
                        <p className="text-gray-600">
                            New to Dashboard?{' '}
                            <Link 
                                to="/accounts/sign-up" 
                                className="text-black hover:text-gray-700 font-medium"
                            >
                                Create an account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginPage;