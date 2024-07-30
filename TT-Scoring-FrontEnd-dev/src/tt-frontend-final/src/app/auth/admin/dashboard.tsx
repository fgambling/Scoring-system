"use client";

import { useEffect, useState } from 'react';
import { fetchUsersInfo } from "@/utils/http";
import { UserData } from '@/interface/user-interface';
import UserActionBox from "@/components/admin/dashboard/UserActionBox";
import UserInfoTable from "@/components/admin/dashboard/UserInfoTable";
import { useSnackbar } from "@/context/SnackbarContext";
import Loading from '@/components/Loading';

//main function component for the dashboard page
const dashboardPage = () => {
    const { showSnackbar } = useSnackbar();
    const [rows, setRows] = useState<UserData []>([]);
    const [user, setUser] = useState<UserData>({
        _id: 0,
        username: '',
        email: '',
        roles: [],
        status: '',
    });
    const [loading, setLoading] = useState<Boolean>(false);


    async function loadData(isLoading: Boolean) {
        try {
            isLoading && setLoading(true);
            
            const userRows = await fetchUsersInfo();
            if (userRows && userRows.data.length > 0) {
                setRows(userRows.data);
                setUser(userRows.data[0]);

                isLoading && setLoading(false);
            }
        } catch (error) {
            // showSnackbar("User Fetch error", "error");
        }
    };
    
    //useEffect hook to fetch user data on component
    useEffect(() => {
        loadData(false);
    }, []);

    return (
        <div className="flex flex-1 mt-4">
            <aside className="flex flex-col theme-content-bg w-80 p-8">
                {
                    rows.length > 0 && !loading ?
                    (<UserActionBox user={user} callback={() => loadData(true)}/>) :
                    (
                        <div className='flex flex-1 justify-center items-center'>
                            <Loading />
                        </div>
                    )
                }
            </aside>
            <main className="flex flex-1 theme-content-bg ml-4 p-8">
                {
                    rows.length > 0 && !loading ?
                    (<UserInfoTable setUser={setUser} rows={rows}/>) :
                    (
                        <div className='flex flex-1 justify-center items-center'>
                            <Loading />
                        </div>
                    )
                }
            </main>
        </div>
    )
};

export default dashboardPage;