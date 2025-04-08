
import { useState } from "react";
import { CalendarIcon, ImagePlus, Trash2 } from "lucide-react";
import { Project } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

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
  
  // Mock photo groups by date
  const photoGroups: PhotoGroup[] = [
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedPhotos(prev => [...prev, ...Array.from(e.target.files || [])]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This would typically upload the photos to a server
    console.log("Uploading photos:", uploadedPhotos);
    console.log("Description:", description);
    console.log("Date:", date);
    
    // Reset form
    setUploadedPhotos([]);
    setDescription("");
  };

  const removeUpload = (index: number) => {
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
                  />
                  <Button type="button" variant="outline" size="icon">
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
                          onClick={() => removeUpload(index)}
                          className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full transform translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
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
                disabled={uploadedPhotos.length === 0 || !date}
              >
                Upload Photos
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Card className="card-shadow lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Photo Gallery</CardTitle>
          </CardHeader>
          <CardContent>
            {photoGroups.length > 0 ? (
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
                          <img 
                            src={photo.url} 
                            alt={photo.description}
                            className="h-32 w-full object-cover transition-transform duration-200 group-hover:scale-105"
                          />
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
