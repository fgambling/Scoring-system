"use client";

import { useEffect, useState } from 'react';
import { UserRole, useUserContext } from "@/context/UserContext";

import AdminDashboard from '@/app/auth/admin/dashboard';
import MarkerDashboard from '@/app/auth/marker/dashboard';
import Loading from '@/components/Loading';

//main function component for the dashboard page
const dashboardPage = () => {
    const { userRoles } = useUserContext();

    //useEffect hook to fetch user data on component
    useEffect(() => {
    }, []);

    return (
        <div className='flex flex-1'>
            {
                (userRoles.includes(UserRole.MARKER) && <MarkerDashboard />)
            }
        </div>
    )
};

export default dashboardPage;