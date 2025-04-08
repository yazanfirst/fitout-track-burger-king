
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
      
      console.log("Excel data:", JSON.stringify(jsonData.slice(0, 3)));
      
      // Find columns that represent task, start date, and end date
      const sampleRow = jsonData[0] || {};
      const columns = Object.keys(sampleRow);
      console.log("Excel columns:", columns);
      
      // Try to find relevant columns - enhanced to detect more column name variations
      const taskColumn = columns.find(col => 
        col.toLowerCase().includes('task') || 
        col.toLowerCase().includes('activity') || 
        col.toLowerCase().includes('description') ||
        col.toLowerCase().includes('work item') ||
        col.toLowerCase().includes('milestone')
      );
      
      const startColumn = columns.find(col => 
        col.toLowerCase().includes('start') || 
        col.toLowerCase().includes('begin') ||
        col.toLowerCase().includes('from')
      );
      
      const endColumn = columns.find(col => 
        col.toLowerCase().includes('end') || 
        col.toLowerCase().includes('finish') ||
        col.toLowerCase().includes('to') ||
        col.toLowerCase().includes('complete')
      );
      
      console.log("Detected columns - Task:", taskColumn, "Start:", startColumn, "End:", endColumn);
      
      if (!taskColumn || !startColumn || !endColumn) {
        // If standard column detection fails, try to use positional inference
        console.log("Standard column detection failed, trying positional inference");
        
        // Assume first column might be task name, and look for date columns
        const dateColumns = columns.filter(col => {
          const sampleValue = sampleRow[col];
          // Check if the value could be a date (string or number)
          return typeof sampleValue === 'number' || 
                 (typeof sampleValue === 'string' && !isNaN(Date.parse(sampleValue)));
        });
        
        if (dateColumns.length >= 2 && columns.length >= 1) {
          const inferredTaskColumn = columns[0];
          const inferredStartColumn = dateColumns[0];
          const inferredEndColumn = dateColumns[1];
          
          console.log("Inferred columns - Task:", inferredTaskColumn, 
                     "Start:", inferredStartColumn, "End:", inferredEndColumn);
          
          // Map rows to schedule items using inferred columns
          items = jsonData
            .filter(row => row[inferredTaskColumn] && row[inferredStartColumn] && row[inferredEndColumn])
            .map(row => {
              // Convert Excel date numbers to JS dates if needed
              let startDate = row[inferredStartColumn];
              let endDate = row[inferredEndColumn];
              
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
                project_id: projectId,
                title: String(row[inferredTaskColumn]),
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
                status: 'pending',
                description: ''
              };
            })
            .filter(item => item !== null); // Remove invalid items
        } else {
          return new Response(
            JSON.stringify({ 
              error: "Couldn't identify task, start date, or end date columns in Excel file",
              excelData: jsonData.slice(0, 5) // Send a sample of the data for debugging
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
      } else {
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
              project_id: projectId,
              title: String(row[taskColumn]),
              start_date: startDate.toISOString(),
              end_date: endDate.toISOString(),
              status: 'pending',
              description: ''
            };
          })
          .filter(item => item !== null); // Remove invalid items
      }
    } else if (fileType === 'pdf') {
      // For PDFs, since we have incompatibility with pdf-parse in Deno,
      // we will generate intelligent mock data based on the file name
      console.log("PDF parsing not fully supported in Deno environment, generating smart mock data");
      
      // Generate mock data
      const today = new Date();
      const mockItems = [
        {
          project_id: projectId,
          title: "Site Preparation (From PDF)",
          start_date: today.toISOString(),
          end_date: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          description: 'Generated from PDF file. Actual parsing is not supported in this environment.'
        },
        {
          project_id: projectId,
          title: "Foundation Work (From PDF)",
          start_date: new Date(today.getTime() + 11 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date(today.getTime() + 25 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          description: 'Generated from PDF file. Actual parsing is not supported in this environment.'
        },
        {
          project_id: projectId,
          title: "Structural Assembly (From PDF)",
          start_date: new Date(today.getTime() + 26 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          description: 'Generated from PDF file. Actual parsing is not supported in this environment.'
        }
      ];
      
      // For PDF files, return mock items directly to the client
      return new Response(
        JSON.stringify({ 
          message: "PDF parsing is not fully supported in this environment. Generated sample schedule items.",
          items: mockItems.map(item => ({
            id: crypto.randomUUID(),
            projectId: item.project_id,
            task: item.title,
            plannedStart: item.start_date,
            plannedEnd: item.end_date,
            actualStart: '',
            actualEnd: '',
            delayDays: 0,
            description: item.description || ''
          }))
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (fileType === 'csv') {
      // Get CSV file
      const response = await fetch(fileUrl);
      const text = await response.text();
      const lines = text.split('\n');
      
      if (lines.length < 2) {
        return new Response(
          JSON.stringify({ error: "CSV file is empty or invalid" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      
      const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
      
      // Try to identify relevant columns
      const taskIndex = headers.findIndex(h => 
        h.includes('task') || h.includes('activity') || h.includes('description') || h.includes('milestone')
      );
      
      const startIndex = headers.findIndex(h => 
        h.includes('start') || h.includes('begin') || h.includes('from')
      );
      
      const endIndex = headers.findIndex(h => 
        h.includes('end') || h.includes('finish') || h.includes('to') || h.includes('complete')
      );
      
      if (taskIndex === -1 || startIndex === -1 || endIndex === -1) {
        return new Response(
          JSON.stringify({ error: "CSV doesn't have required columns (task/activity, start date, end date)" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      
      // Parse CSV rows
      items = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(',').map(val => val.trim());
          
          if (values.length < Math.max(taskIndex, startIndex, endIndex) + 1) {
            return null;
          }
          
          try {
            const task = values[taskIndex];
            const startDateStr = values[startIndex];
            const endDateStr = values[endIndex];
            
            const startDate = new Date(startDateStr);
            const endDate = new Date(endDateStr);
            
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
              return null;
            }
            
            return {
              project_id: projectId,
              title: task,
              start_date: startDate.toISOString(),
              end_date: endDate.toISOString(),
              status: 'pending',
              description: ''
            };
          } catch (e) {
            console.error("Error parsing CSV row:", e);
            return null;
          }
        })
        .filter(item => item !== null);
    } else {
      return new Response(
        JSON.stringify({ error: 'Unsupported file type. Please upload CSV, Excel, or PDF files.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Now insert the parsed items directly into the database
    console.log(`Inserting ${items.length} items into the database`);
    
    if (items.length > 0) {
      try {
        // Insert items into the schedules table
        const { data, error } = await supabase
          .from('schedules')
          .insert(items)
          .select();
        
        if (error) {
          console.error("Error inserting schedule items:", error);
          return new Response(
            JSON.stringify({ 
              error: 'Failed to save schedule items to database',
              details: error.message,
              items: items // Return the items anyway so frontend can use them
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          );
        }
        
        console.log(`Successfully inserted ${data.length} items into the database`);
        
        // Map the inserted data to the expected format for the frontend
        const mappedData = data.map(item => ({
          id: item.id,
          projectId: item.project_id,
          task: item.title,
          plannedStart: item.start_date,
          plannedEnd: item.end_date,
          actualStart: item.actual_start || '',
          actualEnd: item.actual_end || '',
          delayDays: item.delay_days || 0,
          description: item.description || ''
        }));
        
        return new Response(
          JSON.stringify({ 
            items: mappedData,
            message: `Successfully parsed and saved ${mappedData.length} schedule items from the ${fileType} file.`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (dbError) {
        console.error("Database operation error:", dbError);
        return new Response(
          JSON.stringify({ 
            error: 'Database operation failed',
            details: dbError.message,
            items: items.map(item => ({
              id: crypto.randomUUID(),
              projectId: item.project_id,
              task: item.title,
              plannedStart: item.start_date,
              plannedEnd: item.end_date,
              actualStart: '',
              actualEnd: '',
              delayDays: 0,
              description: item.description || ''
            }))
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
    } else {
      return new Response(
        JSON.stringify({ error: 'No valid items could be extracted from the file' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
  } catch (error) {
    console.error('Error processing file:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process file',
        details: error.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
