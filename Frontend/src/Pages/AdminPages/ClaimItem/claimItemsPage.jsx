import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import ClaimsTable from './ClaimItemsTable';
import axios from 'axios';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
const SERVER_URL = import.meta.env.VITE_BACKEND_URL;

export default function ClaimItemsListingPage() {
    const [searchParams] = useSearchParams();
    const [claims, setClaims] = useState([]);
    const [totalClaims, setTotalClaims] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const getQueryParams = useCallback(() => {
        const page = parseInt(searchParams.get('page') || '1', 10);
        const search = searchParams.get('q') || '';
        const status = searchParams.get('status') || '';
        const limit = parseInt(searchParams.get('limit') || '10', 10);
        return { page, search, status, limit };
    }, [searchParams]);

    const fetchClaims = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${SERVER_URL}/api/claim`, {
                params: getQueryParams(),
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                withCredentials: true,
            });
            if (response.data.success) {
                const claimsWithRefresh = response.data.claims.map(claim => ({
                    ...claim,
                    refreshData: fetchClaims
                }));
                setClaims(claimsWithRefresh);
                setTotalClaims(response.data.totalClaims);
                setTotalPages(response.data.totalPages);
            }
        } catch (error) {
            console.error('Failed to fetch claims:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to fetch claims. Please try again."
            });
        } finally {
            setIsLoading(false);
        }
    }, [getQueryParams]);

    useEffect(() => {
        fetchClaims();
    }, [searchParams, fetchClaims]);


    return (
        <div className="space-y-4 m-5">
            <div className="flex items-start justify-between">
                <Heading
                    title={`Claims (${totalClaims})`}
                    description="Manage Claims"
                />
            </div>
            <Separator />
            <ClaimsTable 
                data={claims} 
                totalData={totalPages} 
                isLoading={isLoading}
            />
        </div>
    );
}