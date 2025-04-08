
// Follow Deno best practices for imports
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import * as XLSX from 'https://esm.sh/xlsx@0.18.5';

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle requests
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    const { fileUrl, projectId, fileType } = await req.json();
    
    if (!fileUrl || !projectId || !fileType) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Process based on file type
    let items = [];
    
    if (fileType === 'xlsx' || fileType === 'xls') {
      // Get Excel file
      const response = await fetch(fileUrl);
      const arrayBuffer = await response.arrayBuffer();
      
      // Parse Excel file
      const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);
      
      // Find columns that represent task, start date, and end date
      const sampleRow = jsonData[0] || {};
      const columns = Object.keys(sampleRow);
      
      // Try to find relevant columns
      const taskColumn = columns.find(col => 
        col.toLowerCase().includes('task') || 
        col.toLowerCase().includes('activity') || 
        col.toLowerCase().includes('description')
      );
      
      const startColumn = columns.find(col => 
        col.toLowerCase().includes('start') || 
        col.toLowerCase().includes('begin')
      );
      
      const endColumn = columns.find(col => 
        col.toLowerCase().includes('end') || 
        col.toLowerCase().includes('finish')
      );
      
      if (!taskColumn || !startColumn || !endColumn) {
        return new Response(
          JSON.stringify({ error: "Couldn't identify task, start date, or end date columns in Excel file" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      
      // Map rows to schedule items
      items = jsonData
        .filter(row => row[taskColumn] && row[startColumn] && row[endColumn])
        .map(row => {
          // Convert Excel date numbers to JS dates if needed
          let startDate = row[startColumn];
          let endDate = row[endColumn];
          
          // Excel stores dates as numbers representing days since Jan 1, 1900
          if (typeof startDate === 'number') {
            startDate = new Date(Math.round((startDate - 25569) * 86400 * 1000));
          } else if (typeof startDate === 'string') {
            startDate = new Date(startDate);
          }
          
          if (typeof endDate === 'number') {
            endDate = new Date(Math.round((endDate - 25569) * 86400 * 1000));
          } else if (typeof endDate === 'string') {
            endDate = new Date(endDate);
          }
          
          // Skip invalid dates
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return null;
          }
          
          return {
            projectId,
            task: String(row[taskColumn]),
            plannedStart: startDate.toISOString(),
            plannedEnd: endDate.toISOString(),
            actualStart: '',
            actualEnd: '',
            delayDays: 0
          };
        })
        .filter(item => item !== null); // Remove invalid items
      
    } else if (fileType === 'pdf') {
      // For PDF files, we'd need a specific PDF parsing library
      // This is more complex and would require additional dependencies
      // For now, we'll return an informative error
      
      return new Response(
        JSON.stringify({ 
          error: "PDF parsing is not fully implemented in this demo. In a production app, we'd use a PDF parsing library or service.",
          mockItems: [
            {
              projectId,
              task: "Site Preparation (Mock PDF Data)",
              plannedStart: new Date().toISOString(),
              plannedEnd: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
              actualStart: '',
              actualEnd: '',
              delayDays: 0
            },
            {
              projectId,
              task: "Demolition (Mock PDF Data)",
              plannedStart: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString(),
              plannedEnd: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
              actualStart: '',
              actualEnd: '',
              delayDays: 0
            }
          ]
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Unsupported file type' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    return new Response(
      JSON.stringify({ items }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error processing file:', error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to process file' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
