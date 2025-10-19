import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
const SERVER_URL = import.meta.env.VITE_BACKEND_URL;

const ClaimPage = () => {
    const { id } = useParams();
    const [claim, setClaim] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchClaimDetails = async () => {
            try {
                const response = await axios.get(`${SERVER_URL}/api/claim/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    withCredentials: true,
                });
                if (response.data.success) {
                    setClaim(response.data.claim);
                } else {
                    toast({
                        variant: 'destructive',
                        title: 'Error',
                        description: response.data.message,
                    });
                }
            } catch (error) {
                console.error('Error fetching claim details:', error);
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Failed to fetch claim details. Please try again.',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchClaimDetails();
    }, [id, toast]);

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'accepted':
                return 'text-green-600';
            case 'rejected':
                return 'text-red-600';
            default:
                return 'text-yellow-600';
        }
    };

    const updateStatus = async (newStatus) => {
        setUpdatingStatus(true);
        try {
            const response = await axios.put(
                `${SERVER_URL}/api/claim/verify`,
                { status: newStatus, claimId: id },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    withCredentials: true,
                }
            );
            if (response.data.success) {
                setClaim({ ...claim, status: newStatus });
                toast({
                    variant: 'default',
                    title: 'Success',
                    description: 'Claim status updated',
                });
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: response.data.message,
                });
            }
        } catch (error) {
            console.error('Error updating claim status:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to update claim status. Please try again.',
            });
        } finally {
            setUpdatingStatus(false);
        }
    };

    if (!claim || loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Claim Details</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    <div>
                        <h2 className="text-2xl font-bold">{claim.item.name}</h2>
                        <div className="flex items-center gap-4 mt-2">
                            <img
                                src={claim.item.images[0].url}
                                alt={claim.item.name}
                                className="h-20 w-20 rounded-md object-cover"
                            />
                            <div>
                                <p className="text-gray-500">{claim.item.description}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="outline" className="text-sm">
                                        {claim.category.name}
                                    </Badge>
                                    <Badge variant={getStatusColor(claim.item.status)}>
                                        {claim.item.status.charAt(0).toUpperCase() + claim.item.status.slice(1)}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <h3 className="text-xl font-medium mb-4">Claimed By</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <CardDescription>Name</CardDescription>
                                <p>{claim.claimBy.firstName} {claim.claimBy.lastName}</p>
                            </div>
                            <div>
                                <CardDescription>Email</CardDescription>
                                <p>{claim.claimBy.email}</p>
                            </div>
                            <div>
                                <CardDescription>Phone</CardDescription>
                                <p>{claim.claimBy.phoneNumber}</p>
                            </div>
                            <div>
                                <CardDescription>Address</CardDescription>
                                <p>{claim.claimBy.address?.street}, {claim.claimBy.address?.city}, {claim.claimBy.address?.state}, {claim.claimBy.address?.country} {claim.claimBy.address?.postalCode}</p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <h3 className="text-xl font-medium mb-4">Claim Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <CardDescription>Status</CardDescription>
                                <Badge variant={getStatusColor(claim.status)}>
                                    {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                                </Badge>
                            </div>
                            <div>
                                <CardDescription>Date Reported</CardDescription>
                                <p>{new Date(claim.dateReported).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        {claim.status !== 'accepted' && claim.status !== 'rejected' && (
                            <div> <Button
                                variant="primary"
                                disabled={updatingStatus}
                                onClick={() => updateStatus('accepted')}
                            >
                                Accept Claim
                            </Button>
                                <Button
                                    variant="destructive"
                                    disabled={updatingStatus}
                                    onClick={() => updateStatus('rejected')}
                                >
                                    Reject Claim
                                </Button></div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ClaimPage;