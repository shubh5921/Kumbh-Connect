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
import { Textarea } from "@/components/ui/textarea"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useAddItemCategoryMutation } from "@/slices/categorySlice"

const categorySchema = z.object({
    name: z.string().min(1, "Item Categroy Name is required"),
    description: z.string().min(1, "Item Category Description is required"),
    image: z
        .string({required_error: "Image Url is required"})
        .regex(/^https?:\/\/(www\.)?[\w\-]+(\.[\w\-]+)+([\/\w\-.,@?^=%&:/~+#]*)?$/i,{message:"Invalid Image Url."}),
})


export default function AddItemCategoryPage() {

    const navigate = useNavigate();
    const [addItemCategory, {isLoading}] = useAddItemCategoryMutation();

    const form = useForm({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name:"",
            description:"",
            image:""
        },
    })

    async function onSubmit(data) {
        try {
            const res = await addItemCategory(data).unwrap();
            if (res.success) {
                toast({
                    title: "Item Category Added Successfully",
                });
    
                navigate('/dashboard',{replace:true});
            } else {
                toast({
                    title: "Failed to Add Category",
                    description: res.message,
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Failed to Add Category",
                description: error?.data?.message || "An unexpected error occurred.",
                variant: "destructive",
            });
        }
    }
    

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className='text-center'>
                    <h1 className='text-4xl font-extrabold tracking-tight lg:text-3xl mb-6'>New Category</h1>
                    <p className='mb-4'>Fill following details</p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input type="text" placeholder="Name" {...field} />
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
                                        <Textarea type="text" placeholder="Description" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="image"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Icon</FormLabel>
                                    <FormControl>
                                        <Input type="text" placeholder="Icon Link" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-center">
                            <Button className="w-full" type="submit" disabled={isLoading}>
                                {
                                    isLoading ?
                                        <>
                                            <Loader2 className="animate-spin mr-2" />Please Wait
                                        </> : <>Submit</>
                                }
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    )
}
