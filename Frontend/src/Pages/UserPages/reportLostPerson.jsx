import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import {
    Loader2,
    ImagePlus,
    Trash2,
    MapPin,
    User,
    Phone,
    Home,
    AlertTriangle,
    ArrowRight,
    ImageIcon,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useReportLostPersonMutation } from "@/slices/personSlice";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import "leaflet/dist/leaflet.css";
import { Separator } from '@/components/ui/separator';

const personSchema = z.object({
    name: z
        .string({
            required_error: "Person Name is required",
            invalid_type_error: "Person Name must be a string",
        }),
    description: z
        .string({
            required_error: "Person Description is required",
            invalid_type_error: "Person Description must be a string",
        }),
    age: z.string()
        .nonempty("Age is required")
        .refine((val) => !isNaN(parseInt(val)), "Age must be a number")
        .transform((val) => parseInt(val))
        .refine((val) => val >= 0, "Age must be a positive number")
        .refine((val) => val <= 150, "Age must be reasonable"),
    guardian: z.object({
        name: z
            .string({
                required_error: "Guardian Name is required",
                invalid_type_error: "Guardian Name must be a string",
            }),
        phoneNumber: z
            .string({
                required_error: "Guardian Phone Number is required",
                invalid_type_error: "Guardian Phone Number must be a string",
            }),
        relation: z
            .string({
                required_error: "Guardian Relation is required",
                invalid_type_error: "Guardian Relation must be a string",
            }),
        address: z.object({
            street: z
                .string({ required_error: "Guardian Street is required" }),
            city: z
                .string({ required_error: "Guardian City is required" }),
            state: z
                .string({ required_error: "Guardian State is required" }),
            postalCode: z
                .string({ required_error: "Guardian Postal Code is required" }),
        }),
    }),
    images: z.array(z.instanceof(File))
        .refine(
            (files) => files.every((file) => file.type.startsWith('image/')),
            { message: "Only image files are allowed" }
        )
        .refine(
            (files) => files.every((file) => file.size <= 5 * 1024 * 1024),
            { message: "Each image must be 5MB or smaller" }
        )
        .optional(),
    location: z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
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

const SectionTitle = ({ icon: Icon, title, urgent }) => (
    <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-lg ${urgent ? 'bg-red-100' : 'bg-blue-100'}`}>
            <Icon className={`h-5 w-5 ${urgent ? 'text-red-500' : 'text-blue-500'}`} />
        </div>
        <h2 className="text-xl font-semibold">{title}</h2>
    </div>
);

export default function ReportLostPersonPage() {
    const navigate = useNavigate();
    const [reportPerson, { isLoading: isReporting }] = useReportLostPersonMutation();
    const [previewImages, setPreviewImages] = useState([]);
    const [location, setLocation] = useState({
        latitude: 25.427980726672878,
        longitude: 81.77186608292688
    });

    const form = useForm({
        resolver: zodResolver(personSchema),
        defaultValues: {
            name: "",
            description: "",
            age: "",
            guardian: {
                name: "",
                phoneNumber: "",
                relation: "",
                address: {
                    street: "",
                    city: "",
                    state: "",
                    postalCode: "",
                },
            },
            images: [],
            location: {
                latitude: 25.427980726672878,
                longitude: 81.77186608292688
            },
        },
    });

    const handleImageUpload = (event) => {
        const files = Array.from(event.target.files || []);

        const validFiles = files.filter(file =>
            file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024
        );

        const previews = validFiles.map(file => URL.createObjectURL(file));

        const existingImages = form.getValues('images') || [];

        const allImages = [...existingImages, ...validFiles];
        form.setValue('images', allImages);

        setPreviewImages(prevPreviews => [...prevPreviews, ...previews]);

        if (validFiles.length !== files.length) {
            toast({
                title: "Image Upload Warning",
                description: "Some files were skipped due to invalid type or size",
                variant: "destructive",
            });
        }
    };

    const removeImage = (indexToRemove) => {
        URL.revokeObjectURL(previewImages[indexToRemove]);

        const updatedImages = form.getValues('images').filter((_, index) => index !== indexToRemove);
        const updatedPreviews = previewImages.filter((_, index) => index !== indexToRemove);

        form.setValue('images', updatedImages);
        setPreviewImages(updatedPreviews);
    };

    async function onSubmit(data) {
        try {
            const formData = new FormData();

            formData.append('name', data.name);
            formData.append('description', data.description);
            formData.append('age', Number(data.age));
            formData.append('guardian', JSON.stringify(data.guardian));
            formData.append('location', JSON.stringify(location));

            data.images.forEach((file, index) => {
                formData.append(`images`, file);
            });

            const res = await reportPerson(formData).unwrap();
            if (res.success) {
                previewImages.forEach(URL.revokeObjectURL);
                toast({ title: "Success!", description: "Person reported successfully" });
                navigate("/menu", { replace: true });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error?.data?.message || "An unexpected error occurred.",
                variant: "destructive",
            });
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Report Missing Person</h1>
                    <p className="text-gray-500">Please provide accurate information to help locate the person</p>
                </div>

                <Alert className="bg-yellow-50 border-yellow-200">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                        In case of emergency, please contact local law enforcement immediately.
                    </AlertDescription>
                </Alert>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <Card className="shadow-lg">
                            <CardContent className="p-6 space-y-8">
                                <div>
                                    <SectionTitle icon={User} title="Person Details" urgent={true} />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Person's Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Full name" className="bg-white" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="age"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Age</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            placeholder="Age in years"
                                                            className="bg-white"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="mt-6">
                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Physical Description</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Height, weight, clothing worn, distinctive features..."
                                                            className="min-h-[120px] bg-white"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <SectionTitle icon={Phone} title="Guardian Contact Information" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="guardian.name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Guardian's Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Full name" className="bg-white" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="guardian.phoneNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Contact Number</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="6758462578" className="bg-white" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="guardian.relation"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Relationship to Person</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., Parent, Sibling" className="bg-white" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="mt-6">
                                        <SectionTitle icon={Home} title="Guardian's Address" />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="guardian.address.street"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Street Address</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Street address" className="bg-white" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="guardian.address.city"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>City</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="City" className="bg-white" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="guardian.address.state"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>State/Province</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="State" className="bg-white" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="guardian.address.postalCode"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Postal Code</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Postal code" className="bg-white" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <SectionTitle icon={MapPin} title="Last Known Location" urgent={true} />
                                        <div className="bg-white rounded-lg overflow-hidden border">
                                            <div className="h-[300px]">
                                                <MapContainer
                                                    center={[location.latitude, location.longitude]}
                                                    zoom={13}
                                                    style={{ height: "100%", width: "100%" }}
                                                    className="z-0"
                                                >
                                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                                    <LocationMarker location={location} setLocation={setLocation} />
                                                </MapContainer>
                                            </div>
                                            <div className="p-3 bg-gray-50 border-t flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm text-gray-600">Click on the map to mark the last known location</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <h2 className="text-xl font-semibold flex items-center gap-2">
                                        <div className="h-8 w-1 bg-blue-500 rounded-full" />
                                        Images
                                    </h2>
                                    <div className="space-y-3">
                                        <FormField
                                            control={form.control}
                                            name="images"
                                            render={({ field: { onChange, value, ...fieldProps } }) => (
                                                <FormItem>
                                                    <FormLabel>Upload Images</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="file"
                                                            multiple
                                                            accept="image/*"
                                                            onChange={handleImageUpload}
                                                            className="hidden"
                                                            id="image-upload"
                                                            {...fieldProps}
                                                        />
                                                    </FormControl>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="w-full"
                                                        onClick={() => document.getElementById('image-upload').click()}
                                                    >
                                                        <ImagePlus className="mr-2 h-4 w-4" />
                                                        Add Images
                                                    </Button>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {previewImages.length > 0 && (
                                            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                                                {previewImages.map((preview, index) => (
                                                    <div
                                                        key={index}
                                                        className="relative group"
                                                    >
                                                        <img
                                                            src={preview}
                                                            alt={`Preview ${index + 1}`}
                                                            className="w-full h-24 object-cover rounded-lg"
                                                        />
                                                        <Button
                                                            type="button"
                                                            size="icon"
                                                            variant="destructive"
                                                            className="absolute top-1 right-1 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => removeImage(index)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {previewImages.length === 0 && (
                                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6">
                                                <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
                                                <p className="text-sm text-gray-500">
                                                    No images uploaded yet
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-end gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => navigate(-1)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isReporting}
                                        className="min-w-[140px]"
                                    >
                                        {isReporting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                Submit Report
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </Form>
            </div>
        </div>
    );
}