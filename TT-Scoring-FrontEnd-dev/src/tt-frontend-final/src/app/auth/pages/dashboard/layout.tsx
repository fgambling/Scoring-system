"use client";

import { Container } from "@mui/material";
import { Inter } from "next/font/google";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/context/UserContext";
import Loading from '@/components/Loading';

const inter = Inter({ subsets: ["latin"] });

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    const router = useRouter();
    const { userRoles } = useUserContext();

    const generateRole = () => {
      let roles = "";

      userRoles.forEach((role, index) => {
        if(index === userRoles.length - 1) roles += role.toUpperCase();
        else roles += role.toUpperCase() + ' / ';
      });

      return roles;
    };

    return (
        <div className={inter.className}>
          <Container
            component="main"
            maxWidth="md"
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
            }}
          >
            {userRoles.length > 0 ? 
                (
                    <div className="flex flex-col p-4 h-lvh w-lvw theme-bg">
                        <header className="flex justify-between items-center h-24 theme-content-bg px-4">
                            <div className="flex items-center">
                                <img src="https://universitiesaustralia.edu.au/wp-content/uploads/2019/05/Melbourne-300x300.png" 
                                     alt="logo" className="h-22 w-24 ml-4 my-2" />
                                <h1 className="text-4xl font-bold ml-4">{generateRole()}</h1>
                            </div>
                            <div className="flex items-center">
                                <div className="flex items-center space-x-2">
                                    <button onClick={() => router.push('/auth')}>
                                        <img src="https://cdn3.iconfinder.com/data/icons/streamline-icon-set-free-pack/48/Streamline-18-1024.png" 
                                             alt="Home" className="h-6 w-6" />
                                    </button>

                                    <button onClick={() => console.log('User clicked')}>
                                        <img src="https://cdn2.iconfinder.com/data/icons/e-commerce-line-4-1/1024/user4-512.png" 
                                             alt="User" className="h-6 w-6" />
                                    </button>

                                    <button onClick={() => console.log('Question clicked')}>
                                        <img src="https://cdn2.iconfinder.com/data/icons/ios-7-icons/50/help-1024.png" 
                                             alt="Question" className="h-6 w-6" />
                                    </button>

                                    <button onClick={() => router.back()}>
                                        <img src="https://cdn2.iconfinder.com/data/icons/arrow-part-1-2/32/Arrow_01_arrow-left-logout-ui-logout_icon-06-512.png" 
                                             alt="Back" className="h-6 w-6" />
                                    </button>
                                </div>
                                <div className="ml-4">
                                    <input type="search" placeholder="Search" className="p-2 h-10 rounded-md" />
                                </div>
                            </div>
                        </header>
                        {children}
                    </div>
                ) :
                (
                    <div className='flex justify-center items-center theme-content-bg w-screen h-screen'>
                        <Loading />
                    </div>
                )
            }
          </Container>
        </div>
      );
}