import { useCallback, useEffect, useState } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import PeopleTable from './PeopleTable';
import axios from 'axios';
import { toast } from '@/components/ui/use-toast';
import { useSearchParams } from 'react-router-dom';
import { useDeletePersonMutation } from '@/slices/personSlice';
import { Loader2 } from 'lucide-react';
const SERVER_URL = import.meta.env.VITE_BACKEND_URL;

export default function PeopleListingPage() {
    const [searchParams] = useSearchParams();
    const [people, setPeople] = useState([]);
    const [totalPeople, setTotalPeople] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [deletePerson, {isLoading: isDeleting}] = useDeletePersonMutation();

    const getQueryParams = useCallback(() => {
        const page = parseInt(searchParams.get('page') || '1', 10);
        const search = searchParams.get('q') || '';
        const status = searchParams.get('status') || '';
        const limit = parseInt(searchParams.get('limit') || '10', 10);
        return { page, search, status, limit };
    }, [searchParams]);

    const handleDeleteItem = async (itemId) => {
        try {
            const res = await deletePerson(itemId).unwrap();
            fetchPeople();
            if (res.success) {
                toast({
                    title: "Person Report Deleted Succesfully",
                });
            } else {
                toast({
                    title: "Failed to Delete Person Report",
                    description: res.message,
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Failed to Delete Person Report",
                description: error?.data?.message || "An unexpected error occurred.",
                variant: "destructive",
            });
        }
    }

    const fetchPeople = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${SERVER_URL}/api/person/q/`, {
                params: getQueryParams(),
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                withCredentials: true,
            });

            if (response.data.success) {
                const peopleWithRefresh = response.data.persons.map(item => ({
                    ...item,
                    refreshData: fetchPeople,
                    deletePerson: handleDeleteItem
                }));
                setPeople(peopleWithRefresh);
                setTotalPeople(response.data.totalPersons);
                setTotalPages(response.data.totalPages);
            }
        } catch (error) {
            console.log(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to fetch Peoples. Please try again."
            })    
        } finally {
            setLoading(false);
        }
    }, [getQueryParams]);

    useEffect(() => {
        fetchPeople();
    }, [searchParams, fetchPeople]);

    return (
        <div className="space-y-4 m-5">
            <div className="flex items-start justify-between">
                <Heading
                    title={`Reports (${totalPeople})`}
                    description="Manage Reported Missing/Found People"
                />
            </div>
            <Separator />
            <PeopleTable data={people} totalData={totalPages}/>
        </div>
    );
}