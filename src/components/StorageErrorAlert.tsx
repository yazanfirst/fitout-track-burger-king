
import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
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
        
        // Required bucket names based on the project requirements
        const requiredBuckets = [
          'project_drawings',
          'project_photos', 
          'project_documents',
          'project_reports',
          'lpo_documents',
          'invoice_documents',
          'project-files'
        ];
        
        const bucketExists: Record<string, boolean> = {};
        
        requiredBuckets.forEach(bucket => {
          bucketExists[bucket] = buckets?.some(b => b.name === bucket) || false;
        });
        
        console.log("Bucket status:", bucketExists);
        setBucketStatus(bucketExists);
        
        // Show alert if any required bucket is missing
        const hasMissingBuckets = Object.values(bucketExists).some(exists => !exists);
        setShow(hasMissingBuckets);
        
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
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <strong className="font-bold">Storage Error: </strong>
            <span className="block sm:inline">{message}</span>
            
            <div className="mt-2 text-sm">
              <p className="font-semibold">Missing buckets:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                {Object.entries(bucketStatus).map(([bucket, exists]) => 
                  !exists && <li key={bucket}>{bucket}</li>
                )}
              </ul>
              <p className="mt-3 text-sm">
                Please create these buckets in your Supabase project under Storage section.
              </p>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setShow(false)}
          className="absolute top-0 right-0 p-2"
          aria-label="close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
