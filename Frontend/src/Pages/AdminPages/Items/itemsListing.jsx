import { useCallback, useEffect, useState } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import ItemsTable from './ItemsTable';
import axios from 'axios';
import { toast } from '@/components/ui/use-toast';
import { useSearchParams } from 'react-router-dom';
import { useDeleteItemMutation } from '@/slices/itemSlice';
import { Loader2 } from 'lucide-react';
const SERVER_URL = import.meta.env.VITE_BACKEND_URL;

export default function ItemsListingPage() {
    const [searchParams] = useSearchParams();
    const [items, setItems] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [deleteItem, {isLoading: isDeleting}] = useDeleteItemMutation();
    const [isLoading, setIsLoading] = useState(false);

    const getQueryParams = useCallback(() => {
        const page = parseInt(searchParams.get('page') || '1', 10);
        const search = searchParams.get('q') || '';
        const status = searchParams.get('status') || '';
        const limit = parseInt(searchParams.get('limit') || '10', 10);
        return { page, search, status, limit };
    }, [searchParams]);

    const handleDeleteItem = async (itemId) => {
        try {
            const res = await deleteItem(itemId).unwrap();
            fetchItems();
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

    const fetchItems = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${SERVER_URL}/api/item/q/`, {
                params: getQueryParams(),
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                withCredentials: true,
            });

            if (response.data.success) {
                const itemsWithRefresh = response.data.items.map(item => ({
                    ...item,
                    refreshData: fetchItems,
                    deleteItem: handleDeleteItem
                }));
                setItems(itemsWithRefresh);
                setTotalItems(response.data.totalItems);
                setTotalPages(response.data.totalPages);
            }
        } catch (error) {
            console.log(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to fetch items. Please try again."
            });
        } finally {
            setIsLoading(false);
        }
    }, [getQueryParams]);

    useEffect(() => {
        fetchItems();
    }, [searchParams, fetchItems]);


    return (
        <div className="space-y-4 m-5">
            <div className="flex items-start justify-between">
                <Heading
                    title={`Reports (${totalItems})`}
                    description="Manage Reported Lost/Found Items"
                />
            </div>
            <Separator />
            <ItemsTable data={items} totalData={totalPages}/>
        </div>
    );
}