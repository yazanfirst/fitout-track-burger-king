
import { useState, useEffect } from "react";
import { CalendarIcon, ImagePlus, Trash2, AlertTriangle } from "lucide-react";
import { Project } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { uploadFile } from "@/lib/api";

interface SitePhotosProps {
  project: Project;
}

interface PhotoGroup {
  date: string;
  photos: {
    id: string;
    url: string;
    description: string;
  }[];
}

export function SitePhotos({ project }: SitePhotosProps) {
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [photoGroups, setPhotoGroups] = useState<PhotoGroup[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchPhotos();
  }, [project.id]);
  
  const fetchPhotos = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('project_id', project.id)
        .order('photo_date', { ascending: false });
      
      if (error) {
        console.error("Error fetching photos:", error);
        toast({
          title: "Error",
          description: "Failed to load photos",
          variant: "destructive",
        });
        
        // Use mock data as fallback
        const mockGroups: PhotoGroup[] = [
          {
            date: "2023-05-15",
            photos: [
              { id: "1", url: "https://images.unsplash.com/photo-1552566626-52f8b828add9", description: "Site preparation" },
              { id: "2", url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5", description: "Foundation work" },
            ]
          },
          {
            date: "2023-05-10",
            photos: [
              { id: "3", url: "https://images.unsplash.com/photo-1521790361543-f645cf042ec4", description: "Initial site survey" },
              { id: "4", url: "https://images.unsplash.com/photo-1531834685032-c34bf0d84c77", description: "Team meeting" },
              { id: "5", url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd", description: "Equipment delivery" },
            ]
          }
        ];
        setPhotoGroups(mockGroups);
      } else {
        // Group photos by date
        const groupedPhotos: Record<string, any[]> = {};
        
        data?.forEach(photo => {
          const photoDate = photo.photo_date;
          if (!groupedPhotos[photoDate]) {
            groupedPhotos[photoDate] = [];
          }
          
          groupedPhotos[photoDate].push({
            id: photo.id,
            url: photo.file_url,
            description: photo.caption || '',
          });
        });
        
        const formattedGroups: PhotoGroup[] = Object.keys(groupedPhotos).map(date => ({
          date,
          photos: groupedPhotos[date]
        }));
        
        setPhotoGroups(formattedGroups.length > 0 ? formattedGroups : []);
      }
    } catch (error) {
      console.error("Error in fetchPhotos:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching photos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedPhotos(prev => [...prev, ...Array.from(e.target.files || [])]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadedPhotos.length === 0 || !date) return;
    
    setIsUploading(true);
    toast({
      title: "Uploading Photos",
      description: `Uploading ${uploadedPhotos.length} photo(s)...`,
    });
    
    try {
      for (const file of uploadedPhotos) {
        // 1. Upload the file to storage
        const fileUrl = await uploadFile(file, project.id, 'photo');
        
        if (!fileUrl) {
          toast({
            title: "Upload Failed",
            description: `Failed to upload ${file.name}`,
            variant: "destructive",
          });
          continue;
        }
        
        // 2. Save photo record to database
        const { data, error } = await supabase
          .from('photos')
          .insert({
            project_id: project.id,
            file_url: fileUrl,
            caption: description,
            photo_date: date.toISOString().split('T')[0],
            taken_by: 'User Upload'
          });
          
        if (error) {
          console.error("Error saving photo record:", error);
          toast({
            title: "Database Error",
            description: `Failed to save photo record for ${file.name}`,
            variant: "destructive",
          });
        }
      }
      
      // Refresh photos list
      await fetchPhotos();
      
      toast({
        title: "Upload Complete",
        description: `Successfully uploaded ${uploadedPhotos.length} photo(s)`,
      });
      
      // Reset form
      setUploadedPhotos([]);
      setDescription("");
    } catch (error) {
      console.error("Error in upload process:", error);
      toast({
        title: "Upload Error",
        description: "An unexpected error occurred during photo upload",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const formatDisplayDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <section id="site-photos" className="content-section">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <span className="mr-2">📷</span> Site Photo Upload
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="card-shadow lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Upload Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Photo Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Upload Photos
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="flex-1"
                    disabled={isUploading}
                  />
                  <Button type="button" variant="outline" size="icon" disabled={isUploading}>
                    <ImagePlus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  You can upload multiple photos at once
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Description
                </label>
                <Textarea
                  placeholder="Add a description for these photos..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[80px]"
                  disabled={isUploading}
                />
              </div>
              
              {uploadedPhotos.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Selected Photos ({uploadedPhotos.length})</p>
                  <div className="grid grid-cols-3 gap-2">
                    {uploadedPhotos.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Upload preview ${index}`}
                          className="h-16 w-16 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full transform translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled={isUploading}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={uploadedPhotos.length === 0 || !date || isUploading}
              >
                {isUploading ? "Uploading..." : "Upload Photos"}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Card className="card-shadow lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Photo Gallery</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : photoGroups.length > 0 ? (
              <div className="space-y-6">
                {photoGroups.map((group) => (
                  <div key={group.date} className="space-y-3">
                    <h3 className="text-sm font-semibold border-b pb-2">
                      {formatDisplayDate(group.date)}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {group.photos.map((photo) => (
                        <div 
                          key={photo.id} 
                          className="group relative overflow-hidden rounded-md"
                        >
                          {photo.url ? (
                            <img 
                              src={photo.url} 
                              alt={photo.description}
                              className="h-32 w-full object-cover transition-transform duration-200 group-hover:scale-105"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1552566626-52f8b828add9";
                              }}
                            />
                          ) : (
                            <div className="h-32 w-full bg-gray-200 flex items-center justify-center">
                              <AlertTriangle className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                            <p className="text-xs text-white truncate">
                              {photo.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <ImagePlus className="h-10 w-10 text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No photos yet</h3>
                <p className="text-sm text-gray-500 max-w-sm mt-1">
                  Upload your first site photos to start building your project gallery
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
