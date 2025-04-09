import { useState, useEffect } from "react";
import { Download, File, FileText, Upload, X } from "lucide-react";
import { Project } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DrawingUploadProps {
  project: Project;
}

interface DrawingFile {
  id: string;
  name: string;
  size: string;
  uploadDate: string;
  type: string;
  url?: string;
}

export function DrawingUpload({ project }: DrawingUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [drawingFiles, setDrawingFiles] = useState<DrawingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDrawings();
  }, [project.id]);

  const fetchDrawings = async () => {
    try {
      setIsLoading(true);
      
      const { data: buckets, error: bucketError } = await supabase
        .storage
        .listBuckets();
      
      console.log("Available buckets:", buckets);
      
      if (bucketError) {
        console.error("Error fetching buckets:", bucketError);
        toast({
          title: "Error",
          description: "Failed to check storage buckets",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      const bucketExists = buckets?.some(bucket => bucket.name === 'project_drawings');
      
      if (!bucketExists) {
        console.error("project_drawings bucket does not exist");
        toast({
          title: "Storage Error",
          description: "Drawing storage is not properly configured",
          variant: "destructive",
        });
        setIsLoading(false);
        
        setDrawingFiles([
          { id: '1', name: 'Kitchen Layout Plan.pdf', size: '2.4 MB', uploadDate: '2023-05-15', type: 'pdf' },
          { id: '2', name: 'Electrical Diagram.pdf', size: '1.8 MB', uploadDate: '2023-05-12', type: 'pdf' },
          { id: '3', name: 'Floor Plan.pdf', size: '3.2 MB', uploadDate: '2023-05-10', type: 'pdf' },
          { id: '4', name: 'Counter Details.dwg', size: '5.7 MB', uploadDate: '2023-05-08', type: 'dwg' },
          { id: '5', name: 'HVAC Systems.pdf', size: '4.1 MB', uploadDate: '2023-05-05', type: 'pdf' },
        ]);
        return;
      }

      const projectPath = `${project.id}`;
      const { data: files, error } = await supabase
        .storage
        .from('project_drawings')
        .list(projectPath, {
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) {
        console.error("Error fetching drawings:", error);
        toast({
          title: "Error",
          description: "Failed to load drawings",
          variant: "destructive",
        });
        
        setDrawingFiles([
          { id: '1', name: 'Kitchen Layout Plan.pdf', size: '2.4 MB', uploadDate: '2023-05-15', type: 'pdf' },
          { id: '2', name: 'Electrical Diagram.pdf', size: '1.8 MB', uploadDate: '2023-05-12', type: 'pdf' },
          { id: '3', name: 'Floor Plan.pdf', size: '3.2 MB', uploadDate: '2023-05-10', type: 'pdf' },
          { id: '4', name: 'Counter Details.dwg', size: '5.7 MB', uploadDate: '2023-05-08', type: 'dwg' },
          { id: '5', name: 'HVAC Systems.pdf', size: '4.1 MB', uploadDate: '2023-05-05', type: 'pdf' },
        ]);
      } else if (files && files.length > 0) {
        const formattedFiles = await Promise.all(files.map(async (file) => {
          const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
          const { data: urlData } = supabase
            .storage
            .from('project_drawings')
            .getPublicUrl(`${projectPath}/${file.name}`);
            
          return {
            id: file.id,
            name: file.name,
            size: formatFileSize(file.metadata?.size || 0),
            uploadDate: new Date(file.created_at || Date.now()).toISOString().split('T')[0],
            type: fileExt,
            url: urlData?.publicUrl
          };
        }));
        
        setDrawingFiles(formattedFiles);
      } else {
        setDrawingFiles([]);
      }
    } catch (error) {
      console.error("Error in fetchDrawings:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching drawings",
        variant: "destructive",
      });
      
      setDrawingFiles([
        { id: '1', name: 'Kitchen Layout Plan.pdf', size: '2.4 MB', uploadDate: '2023-05-15', type: 'pdf' },
        { id: '2', name: 'Electrical Diagram.pdf', size: '1.8 MB', uploadDate: '2023-05-12', type: 'pdf' },
        { id: '3', name: 'Floor Plan.pdf', size: '3.2 MB', uploadDate: '2023-05-10', type: 'pdf' },
        { id: '4', name: 'Counter Details.dwg', size: '5.7 MB', uploadDate: '2023-05-08', type: 'dwg' },
        { id: '5', name: 'HVAC Systems.pdf', size: '4.1 MB', uploadDate: '2023-05-05', type: 'pdf' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(prev => [...prev, ...Array.from(e.target.files || [])]);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsUploading(true);
    toast({
      title: "Uploading",
      description: `Uploading ${selectedFiles.length} drawing${selectedFiles.length > 1 ? 's' : ''}...`,
    });

    try {
      const uploadedFiles: DrawingFile[] = [];
      const projectPath = `${project.id}`;

      for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop()?.toLowerCase();
        const fileName = `${projectPath}/${Date.now()}-${file.name}`;
        
        const { data, error } = await supabase
          .storage
          .from('project_drawings')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (error) {
          console.error("Error uploading file:", error);
          toast({
            title: "Upload Failed",
            description: `Failed to upload ${file.name}`,
            variant: "destructive",
          });
        } else if (data) {
          const { data: urlData } = supabase
            .storage
            .from('project_drawings')
            .getPublicUrl(data.path);
            
          uploadedFiles.push({
            id: data.id || Date.now().toString(),
            name: file.name,
            size: formatFileSize(file.size),
            uploadDate: new Date().toISOString().split('T')[0],
            type: fileExt || '',
            url: urlData?.publicUrl
          });
        }
      }

      if (uploadedFiles.length > 0) {
        setDrawingFiles(prev => [...uploadedFiles, ...prev]);
        toast({
          title: "Success",
          description: `Successfully uploaded ${uploadedFiles.length} drawing${uploadedFiles.length > 1 ? 's' : ''}`,
        });
      }
      
      setSelectedFiles([]);
    } catch (error) {
      console.error("Error in upload process:", error);
      toast({
        title: "Upload Error",
        description: "An unexpected error occurred during upload",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDownload = (file: DrawingFile) => {
    if (file.url) {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast({
        title: "Download Failed",
        description: "File URL not available",
        variant: "destructive",
      });
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'dwg':
        return <File className="h-5 w-5 text-blue-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <section id="drawing-upload" className="content-section">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <span className="mr-2">📐</span> Drawing Upload
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="card-shadow lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Upload Drawings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Drawing Files
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".pdf,.dwg,.dxf,.jpg,.jpeg,.png"
                    multiple
                    onChange={handleFileSelect}
                    className="flex-1"
                    disabled={isUploading}
                  />
                  <Button type="button" variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Supported formats: PDF, DWG, DXF, JPG, PNG
                </p>
              </div>
              
              {selectedFiles.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">
                    Selected Files ({selectedFiles.length})
                  </p>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto border rounded-md p-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                        <div className="flex items-center overflow-hidden">
                          <FileText className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
                          <span className="truncate">{file.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0"
                          disabled={isUploading}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <Button 
                onClick={handleUpload} 
                className="w-full" 
                disabled={selectedFiles.length === 0 || isUploading}
              >
                {isUploading ? "Uploading..." : "Upload Drawings"}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-shadow lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Uploaded Drawings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-md border">
              <div className="grid grid-cols-12 bg-muted p-3 text-xs font-medium text-muted-foreground">
                <div className="col-span-6">Name</div>
                <div className="col-span-2">Size</div>
                <div className="col-span-3">Upload Date</div>
                <div className="col-span-1 text-right">Action</div>
              </div>
              
              <Separator />
              
              {isLoading ? (
                <div className="py-8 flex justify-center items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : drawingFiles.length > 0 ? (
                <div>
                  {drawingFiles.map((file, index) => (
                    <div key={file.id || index}>
                      <div className="grid grid-cols-12 items-center p-3 text-sm">
                        <div className="col-span-6 flex items-center gap-2">
                          {getFileIcon(file.type)}
                          <span className="truncate font-medium">{file.name}</span>
                        </div>
                        <div className="col-span-2 text-muted-foreground">{file.size}</div>
                        <div className="col-span-3 text-muted-foreground">
                          {new Date(file.uploadDate).toLocaleDateString()}
                        </div>
                        <div className="col-span-1 flex justify-end">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleDownload(file)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {index < drawingFiles.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <FileText className="h-10 w-10 text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium text-gray-900">No drawings uploaded</h3>
                  <p className="text-sm text-gray-500 max-w-sm mt-1">
                    Upload your first drawing files to start documenting your project plans
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
