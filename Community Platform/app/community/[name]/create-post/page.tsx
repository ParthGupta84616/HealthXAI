"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CreatePostForm } from '@/components/create-post-form';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

export default function CreatePostPage() {
  const { name } = useParams();
  const [communityId, setCommunityId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  
  useEffect(() => {
    const checkAuthAndGetCommunity = async () => {
      try {
        // Check if user is authenticated
        const userRes = await axios.post("/api/users/profile");
        
        if (!userRes.data.success) {
          router.push("/login");
          return;
        }
        
        // Get community info from MongoDB instead of localStorage
        const communityRes = await axios.get(`/api/communities/by-name/${name}`);
        
        if (!communityRes.data.success || !communityRes.data.community) {
          setError(`Community r/${name} not found`);
          return;
        }
        
        setCommunityId(communityRes.data.community._id);
      } catch (error) {
        console.error("Error:", error);
        toast({
          title: "Error",
          description: "Failed to load community information",
          variant: "destructive",
        });
        router.push("/");
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthAndGetCommunity();
  }, [name, router, toast]);
  
  if (loading) {
    return (
      <div className="container max-w-3xl py-8">
        <p className="text-center">Loading...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container max-w-3xl py-8">
        <div className="bg-red-50 p-4 rounded-md text-red-700">
          <p>{error}</p>
          <button 
            onClick={() => router.push("/")}
            className="text-blue-500 underline mt-2"
          >
            Return to home
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-3xl py-8">
      {communityId && (
        <CreatePostForm 
          communityId={communityId} 
          communityName={name as string} 
        />
      )}
    </div>
  );
}
