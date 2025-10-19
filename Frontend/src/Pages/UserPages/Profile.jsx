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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Loader2, User, MapPin, Package } from "lucide-react";
import { useGetProfileQuery, useUpdateProfileMutation } from "@/slices/userApiSlice";
import { toast } from "@/components/ui/use-toast";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/slices/authSlice";
import {  useDeleteItemMutation, useGetUserItemQuery } from "@/slices/itemSlice";
import Items from "@/components/Items";

const userSchemaUpdateValidate = z.object({
    firstName: z.string({ required_error: "First Name is required" }),
    lastName: z.string().optional(),
    phoneNumber: z
        .string({ required_error: "Mobile Number is required" })
        .regex(/^[6-9]\d{9}$/, { message: "Invalid Mobile Number." }),
    email: z
        .string({ required_error: "Email is required" })
        .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, { message: "Invalid Email Address." }),
    address: z.object({
        street: z.string({ required_error: "Street is required" }),
        city: z.string({ required_error: "City is required" }),
        state: z.string({ required_error: "State is required" }),
        country: z.string({ required_error: "Country is required" }),
        postalCode: z.string({ required_error: "Postal Code is required" }),
    }).optional(),
});

export const ProfilePage = () => {
    const dispatch = useDispatch();
    const { data, isLoading, error, refetch } = useGetProfileQuery();
    const user = data?.user;
    const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
    const [isEditing, setIsEditing] = useState(false);
    const { data: ItemsData, isLoading: isFetchingItems, errorInFetchingItems, refetchItem } = useGetUserItemQuery();
    const items = ItemsData?.items || [];
    const [deleteItem] = useDeleteItemMutation();

    const form = useForm({
        resolver: zodResolver(userSchemaUpdateValidate),
        defaultValues: {
            firstName: "",
            lastName: "",
            phoneNumber: "",
            email: "",
            address: {
                street: "",
                city: "",
                state: "",
                country: "",
                postalCode: ""
            },
        },
    });

    const handleDeleteItem = async (itemId) => {
        try {
            const res = await deleteItem(itemId).unwrap();
            if (res.success) {
                toast({
                    title: "Item Deleted Succesfully",
                });
            } else {
                toast({
                    title: "Failed to Delete Item",
                    description: res.message,
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Failed to Delete Item",
                description: error?.data?.message || "An unexpected error occurred.",
                variant: "destructive",
            });
        }
    }

    useEffect(() => {
        if (error) {
            toast({
                title: "Failed to Fetch Profile",
                description: error?.data?.message || "An unexpected error occurred.",
                variant: "destructive",
            });
        }
        if (errorInFetchingItems) {
            toast({
                title: "Failed to Fetch Items",
                description: errorInFetchingItems?.data?.message || "An unexpected error occurred.",
                variant: "destructive",
            });
        }
    }, [error,errorInFetchingItems, toast]);

    useEffect(() => {
        if (user) {
            form.reset(user);
        }
    }, [user, form]);

    async function onSubmit(data) {
        try {
            const res = await updateProfile(data).unwrap();
            if (res.success) {
                toast({ title: "Profile Updated Successfully" });
                dispatch(setCredentials({ user: res.user, token: res.token }));
                setIsEditing(false);
                form.reset(res.user);
            } else {
                toast({
                    title: "Update Failed",
                    description: res.message,
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Update Failed",
                description: error?.data?.message || "An unexpected error occurred.",
                variant: "destructive",
            });
        }
    }

    if (isLoading || isFetchingItems) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="animate-spin text-gray-600" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
            <div className="mx-auto max-w-6xl space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900">Profile Settings</h1>
                    <Button
                        onClick={() => setIsEditing(!isEditing)}
                        variant={isEditing ? "destructive" : "outline"}
                    >
                        {isEditing ? "Cancel Editing" : "Edit Profile"}
                    </Button>
                </div>

                <Tabs defaultValue="personal" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="personal" className="space-x-2">
                            <User size={16} />
                            <span>Personal Info</span>
                        </TabsTrigger>
                        <TabsTrigger value="items" className="space-x-2">
                            <Package size={16} />
                            <span>Your Items</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="personal">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center space-x-2">
                                            <User size={20} />
                                            <span>Personal Information</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="firstName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>First Name</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} disabled={!isEditing} />
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
                                                    <FormLabel>Last Name</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} disabled={!isEditing} />
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
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} type="email" disabled={!isEditing} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="phoneNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Phone Number</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} type="tel" disabled={!isEditing} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center space-x-2">
                                            <MapPin size={20} />
                                            <span>Address Details</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="address.street"
                                            render={({ field }) => (
                                                <FormItem className="col-span-2">
                                                    <FormLabel>Street Address</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} disabled={!isEditing} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="address.city"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>City</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} disabled={!isEditing} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="address.state"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>State</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} disabled={!isEditing} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="address.country"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Country</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} disabled={!isEditing} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="address.postalCode"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Postal Code</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} disabled={!isEditing} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>

                                {isEditing && (
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={isUpdating}
                                    >
                                        {isUpdating ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                <span>Saving Changes...</span>
                                            </>
                                        ) : (
                                            "Save Changes"
                                        )}
                                    </Button>
                                )}
                            </form>
                        </Form>
                    </TabsContent>

                    <TabsContent value="items">
                        {isFetchingItems ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="animate-spin text-gray-600" size={40} />
                            </div>
                        ) : (
                            <Items items={items} onDeleteItem={handleDeleteItem} refetch={refetch} />
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};