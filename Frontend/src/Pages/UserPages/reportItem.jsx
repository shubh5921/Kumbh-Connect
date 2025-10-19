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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import {
    Loader2,
    ImagePlus,
    Trash2,
    MapPin,
    ArrowRight,
    Image as ImageIcon,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useReportItemMutation } from "@/slices/itemSlice";
import { useGetItemCategoryQuery } from "@/slices/categorySlice";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import "leaflet/dist/leaflet.css";

const itemSchema = z.object({
    name: z.string().nonempty("Item name is required"),
    description: z.string().nonempty("Description is required"),
    status: z.enum(['lost', 'found'], { message: "Status is required" }),
    category: z.string().regex(/^[0-9a-fA-F]{24}$/, { message: "Please select a category" }),
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

export default function ReportItemPage() {
    const navigate = useNavigate();
    const [reportItem, { isLoading: isReporting }] = useReportItemMutation();
    const { data, isLoading: isFetchingCategory } = useGetItemCategoryQuery();
    const categories = data?.categories || [];
    const [previewImages, setPreviewImages] = useState([]);
    const [location, setLocation] = useState({
        latitude: 25.427980726672878,
        longitude: 81.77186608292688
    });

    const form = useForm({
        resolver: zodResolver(itemSchema),
        defaultValues: {
            name: "",
            description: "",
            category: "",
            status: "",
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
            formData.append('status', data.status);
            formData.append('category', data.category);
            formData.append('location', JSON.stringify(location));

            data.images.forEach((file, index) => {
                formData.append(`images`, file);
            });
            const res = await reportItem(formData).unwrap();
            if (res.success) {
                previewImages.forEach(URL.revokeObjectURL);

                toast({ title: "Success!", description: "Item reported successfully" });
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

    if (isFetchingCategory) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Report an Item</h1>
                    <p className="text-gray-500">Submit details about a lost or found item</p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <Card className="shadow-lg">
                            <CardContent className="p-6">
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-semibold flex items-center gap-2">
                                            <div className="h-8 w-1 bg-blue-500 rounded-full" />
                                            Basic Information
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Item Name</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="e.g., Black Leather Wallet"
                                                                className="bg-white"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="status"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Status</FormLabel>
                                                        <Select onValueChange={field.onChange}>
                                                            <FormControl>
                                                                <SelectTrigger className="bg-white">
                                                                    <SelectValue placeholder="Select status" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="lost">Lost</SelectItem>
                                                                <SelectItem value="found">Found</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="category"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Category</FormLabel>
                                                    <Select onValueChange={field.onChange}>
                                                        <FormControl>
                                                            <SelectTrigger className="bg-white">
                                                                <SelectValue placeholder="Select category" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {categories.map((category) => (
                                                                <SelectItem key={category._id} value={category._id}>
                                                                    {category.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
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
                                                            placeholder="Provide detailed description including color, brand, distinguishing features..."
                                                            className="min-h-[120px] bg-white"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <h2 className="text-xl font-semibold flex items-center gap-2">
                                            <div className="h-8 w-1 bg-blue-500 rounded-full" />
                                            Location
                                        </h2>
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
                                                <span className="text-sm text-gray-600">Click on the map to set location</span>
                                            </div>
                                        </div>
                                    </div>

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
                                </div>
                                <div className="mt-2 flex justify-end gap-4">
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