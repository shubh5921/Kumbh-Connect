import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAddStoreMutation } from '@/slices/storeSlice';
import { z } from 'zod';
import { toast } from '@/components/ui/use-toast';

const storeSchemaValidate = z.object({
    name: z
        .string({
            required_error: "Store Name is required",
            invalid_type_error: "Store Name must be a string",
        }),
    description: z
        .string({
            required_error: "Store Description is required",
            invalid_type_error: "Store Description must be a string",
        }),
    address: z
        .string({
            required_error: "Store Address is required",
            invalid_type_error: "Store Address must be a string",
        }),
    phone: z
        .string({
            required_error: "Store Phone is required",
            invalid_type_error: "Store Phone must be a string",
        }),
    hours: z
        .string({
            required_error: "Store Hours are required",
            invalid_type_error: "Store Hours must be a string",
        }),
    latitude: z
        .number({
            required_error: "Store Latitude is required",
            invalid_type_error: "Store Latitude must be a number",
        }),
    longitude: z
        .number({
            required_error: "Store Longitude is required",
            invalid_type_error: "Store Longitude must be a number",
        }),
});

const LocationMarker = ({ location, setLocation }) => {
    useMapEvents({
        click(e) {
            setLocation({ latitude: e.latlng.lat, longitude: e.latlng.lng });
        },
    });

    return location.latitude && location.longitude ? (
        <Marker position={[location.latitude, location.longitude]} />
    ) : null;
};

const AddStorePage = () => {
    const [addStore, { isLoading }] = useAddStoreMutation();
    const [location, setLocation] = useState({
        latitude: 25.427980726672878,
        longitude: 81.77186608292688
    });
    const form = useForm({
        resolver: zodResolver(storeSchemaValidate),
        defaultValues: {
            name: '',
            description: '',
            address: '',
            phone: '',
            hours: '',
            latitude: 25.427980726672878,
            longitude: 81.77186608292688,
        },
    });

    const onSubmit = async (data) => {
        try {
            data.latitude = location.latitude;
            data.longitude = location.longitude;
            const res = await addStore(data).unwrap();
            if (res.success) {
                toast({ title: "Success!", description: "Store Added successfully" });
                form.reset();
            } else {
                toast({
                    title: "Error",
                    description: res.message,
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error adding store:", error);
            toast({
                title: "Error",
                description: error?.data?.message || "An unexpected error occurred.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl text-center font-bold">Add New Store</CardTitle>
                    <CardDescription className="text-center">
                        Fill in the details to add a new pickup store
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Store Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter store name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Provide a description of the store"
                                                className="min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Address</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter store address" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter store phone number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="hours"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Hours</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter store hours" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-4">
                                <FormLabel>Location</FormLabel>
                                <div className="h-[300px] rounded-lg overflow-hidden border">
                                    <MapContainer
                                        center={[location.latitude, location.longitude]}
                                        zoom={13}
                                        style={{ height: "100%", width: "100%" }}
                                        className='z-[0]'
                                    >
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                        <LocationMarker location={location} setLocation={setLocation} />
                                    </MapContainer>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full sm:w-auto"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>Add Store</>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AddStorePage;