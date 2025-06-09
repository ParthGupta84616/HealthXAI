"use client";
import axios from "axios";
import React, {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import { Button, CircularProgress } from "@mui/material";


export default function ProfilePage() {
    const router = useRouter()
    const [buttonDisable, setButtonDisable] = useState(false)
    const [data, setData] = useState<{ _id: string, username : string,email:string } | null>(null)
    const logout = async () => {
        try {
           setButtonDisable(true)
            await axios.get('/api/users/logout')
            router.push('/login')
        } catch (error:any) {
            setButtonDisable(false)
            console.log(error.message);
        }
    }

    useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post('/api/users/profile');
        if(response.data.user){
          setData(response.data.user)
        }
      } catch (error: any) {
        console.log(error.message);
      }
    };
    fetchData();
    },[]);
    

  return (
      <div className="flex items-center justify-center h-screen">
        <div className="">
        <div className="bg-white max-w-2xl shadow overflow-hidden sm:rounded-lg">
    <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
            User Information
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Details and informations about user.
        </p>
    </div>
    <div className="border-t border-gray-200">
        <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                    User ID
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {data?._id}
                </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                     Username
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {data?.username}
                </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                    Email address
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {data?.email}
                </dd>
            </div>
        </dl>
    </div>

      </div>
      <div className="flex items-center justify-center">
      <Button
        fullWidth
        type='submit'
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        onClick={logout}
        className="bg-red-500  hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4"
        startIcon={buttonDisable ? <CircularProgress size={24} /> : null} 
        >
        {buttonDisable ? 'Loging Out...' : 'Logout'} 
        </Button>
      </div>

        </div>
      </div>
  );
}

