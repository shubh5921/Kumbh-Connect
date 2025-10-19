import { Toaster } from '@/components/ui/toaster'
import { toast } from '@/components/ui/use-toast';
import { selectUser } from '@/slices/authSlice';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom'

export default function AuthLayout(){

    const navigate = useNavigate();
    const userInfo = useSelector(selectUser);

    useEffect(() => {
        if (userInfo){
            toast({
                title: "Already Signed In"
            });
            navigate('/menu', { replace: true });
        }
    }, []);

    return (
        <>
            <Toaster />
            <Outlet />
        </>
    )
}