import React from 'react';
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, User, Mail, Phone, Lock, UserPlus } from "lucide-react";
import { useRegisterMutation } from "@/slices/authApiSlice";
import { toast } from "@/components/ui/use-toast";
import { z } from "zod";

const registerFormSchema = z.object({
    firstName: z.string().min(1, "First Name is required"),
    lastName: z.string().optional(),
    email: z
        .string()
        .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, { message: "Invalid Email Address." }),
    phoneNumber: z
        .string({required_error: "Mobile Number is required"})
        .regex(/^[6-9]\d{9}$/,{message:"Invalid Mobile Number."}),
        password: z.
            string({required_error:"Password is Required."})
            .regex(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])(.{8,})$/, {message:"Password must be at least 8 characters long, include an uppercase letter and a special character"})
});

export const RegisterPage = () => {
    const navigate = useNavigate();
    const [register, {isLoading}] = useRegisterMutation();

    const form = useForm({
        resolver: zodResolver(registerFormSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            phoneNumber: "",
            email: "",
            password: "",
        },
    });

    async function onSubmit(data) {
        try {
            const res = await register(data).unwrap();
            if (res.success) {
                toast({
                    title: "Registration Successful",
                });
                navigate('/accounts/sign-in',{replace:true});
            } else {
                toast({
                    title: "Registration Failed",
                    description: res.message,
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Registration Failed",
                description: error?.data?.message || "An unexpected error occurred.",
                variant: "destructive",
            });
        }
    }

    return (
        <div className="flex min-h-screen bg-white">
           <div className="hidden lg:flex lg:w-1/2 bg-black p-12 items-center justify-center relative overflow-hidden">
                <div className="relative z-10 text-white space-y-6">
                    <h1 className="text-4xl font-bold">Welcome To</h1>
                    <p className="text-lg text-gray-300">Mahakumbh Lost and Found</p>
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
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <UserPlus className="h-8 w-8 text-black" />
                        </div>
                        <p className="text-gray-600 mb-8">Create your account to join the community</p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-700">First Name</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                    <Input className="pl-10 border-gray-200 focus:border-black" type="text" placeholder="Lorem" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-700">Last Name</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                    <Input className="pl-10 border-gray-200 focus:border-black" type="text" placeholder="Ipsum" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="phoneNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700">Mobile Number</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Input className="pl-10 border-gray-200 focus:border-black" type="tel" placeholder="9876543210" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700">Email</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Input className="pl-10 border-gray-200 focus:border-black" type="email" placeholder="lorem@example.com" {...field} />
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
                                        <FormLabel className="text-gray-700">Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Input className="pl-10 border-gray-200 focus:border-black" type="password" placeholder="••••••••" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button 
                                className="w-full bg-black hover:bg-gray-800 text-white" 
                                type="submit" 
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2" />
                                        Please Wait
                                    </>
                                ) : (
                                    "Create Account"
                                )}
                            </Button>
                        </form>
                    </Form>

                    <div className="text-center mt-6">
                        <p className="text-gray-600">
                            Already have an account?{' '}
                            <Link to="/accounts/sign-in" className="text-black hover:underline">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;