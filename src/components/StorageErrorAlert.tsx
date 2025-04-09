
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

interface StorageErrorAlertProps {
  message?: string;
}

export function StorageErrorAlert({ message = "Drawing storage is not properly configured" }: StorageErrorAlertProps) {
  const [show, setShow] = useState(false);
  const [bucketStatus, setBucketStatus] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    const checkBuckets = async () => {
      try {
        const { data: buckets, error } = await supabase.storage.listBuckets();
        
        if (error) {
          console.error("Error checking storage buckets:", error);
          setShow(true);
          return;
        }
        
        const requiredBuckets = ['project_drawings', 'project_photos', 'project_files'];
        const bucketExists: Record<string, boolean> = {};
        
        requiredBuckets.forEach(bucket => {
          bucketExists[bucket] = buckets?.some(b => b.name === bucket) || false;
        });
        
        setBucketStatus(bucketExists);
        setShow(Object.values(bucketExists).some(exists => !exists));
        
      } catch (error) {
        console.error("Error in checkBuckets:", error);
        setShow(true);
      }
    };
    
    checkBuckets();
  }, []);
  
  if (!show) return null;
  
  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative shadow-md" role="alert">
        <strong className="font-bold">Storage Error: </strong>
        <span className="block sm:inline">{message}</span>
        <button
          onClick={() => setShow(false)}
          className="absolute top-0 right-0 p-2"
          aria-label="close"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="mt-2 text-sm">
          <p>Missing buckets:</p>
          <ul className="list-disc pl-5 mt-1">
            {Object.entries(bucketStatus).map(([bucket, exists]) => 
              !exists && <li key={bucket}>{bucket}</li>
            )}
          </ul>
          <p className="mt-2">
            Please check the Supabase storage configuration.
          </p>
        </div>
      </div>
    </div>
  );
}
