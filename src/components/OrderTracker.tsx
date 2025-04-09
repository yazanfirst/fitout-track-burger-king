
import { useState, useEffect } from "react";
import { Check, FileText, Plus, Upload } from "lucide-react";
import { Project, OrderItem } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

interface OrderTrackerProps {
  project: Project;
  orders: OrderItem[];
}

interface OrderFormData {
  name: string;
  category: string;
  quantity: string;
  orderDate: Date | undefined;
  expectedDelivery: Date | undefined;
  supplier: string;
  notes: string;
}

const initialFormData: OrderFormData = {
  name: "",
  category: "",
  quantity: "",
  orderDate: new Date(),
  expectedDelivery: undefined,
  supplier: "",
  notes: "",
};

export function OrderTracker({ project, orders: initialOrders }: OrderTrackerProps) {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<OrderFormData>(initialFormData);
  const [orders, setOrders] = useState<OrderItem[]>(initialOrders || []);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Fetch orders from the database
  useEffect(() => {
    fetchOrders();
  }, [project.id]);
  
  // Debug orders
  useEffect(() => {
    console.log(`OrderTracker: Received ${orders?.length || 0} orders for project ${project?.id}`);
  }, [orders, project]);
  
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('project_id', project.id);
      
      if (error) {
        console.error("Error fetching orders:", error);
        toast({
          title: "Error",
          description: "Failed to load orders",
          variant: "destructive",
        });
        setOrders(initialOrders || []);
      } else {
        // Transform the data to match our OrderItem interface
        const formattedOrders = data.map(item => ({
          id: item.id,
          projectId: item.project_id,
          name: item.item_name || '',
          quantity: item.quantity || 0,
          orderDate: item.order_date || '',
          expectedDelivery: item.expected_delivery || '',
          actualDelivery: item.actual_delivery || '',
          status: item.status || 'pending',
          notes: item.notes || '',
          category: item.category || '',
          supplier: item.supplier || '',
          ordered: item.ordered || false,
          lpoReceived: item.lpo_received || false,
          lpoNumber: item.lpo_number || '',
          invoiceNumber: item.invoice_number || '',
          invoiceStatus: item.invoice_status || '0%',
        }));
        
        setOrders(formattedOrders);
      }
    } catch (error) {
      console.error("Error in fetchOrders:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching orders",
        variant: "destructive",
      });
      setOrders(initialOrders || []);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Ensure we have categories, even if empty
  const categories = ['all'];
  if (orders && orders.length > 0) {
    const uniqueCategories = [...new Set(orders.map(order => order.category))];
    uniqueCategories.forEach(category => {
      if (category && !categories.includes(category)) {
        categories.push(category);
      }
    });
  }
  
  const filteredOrders = filterCategory === 'all' 
    ? orders 
    : orders.filter(order => order.category === filterCategory);

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case '100%':
        return 'bg-green-100 text-green-800 border-green-200';
      case '50%':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case '25%':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      category: value
    }));
  };
  
  const handleSubmit = async () => {
    if (!formData.name || !formData.category || !formData.orderDate) {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Insert into database
      const { data, error } = await supabase
        .from('orders')
        .insert({
          project_id: project.id,
          item_name: formData.name,
          category: formData.category,
          quantity: parseInt(formData.quantity) || 0,
          order_date: formData.orderDate.toISOString().split('T')[0],
          expected_delivery: formData.expectedDelivery ? formData.expectedDelivery.toISOString().split('T')[0] : null,
          supplier: formData.supplier,
          notes: formData.notes,
          ordered: true,
          lpo_received: false,
          invoice_status: '0%'
        })
        .select()
        .single();
        
      if (error) {
        console.error("Error creating order:", error);
        toast({
          title: "Error",
          description: "Failed to create order",
          variant: "destructive",
        });
        return;
      }
      
      // Update project status counters
      const newOrder = {
        id: data.id,
        projectId: data.project_id,
        name: data.item_name,
        quantity: data.quantity,
        orderDate: data.order_date,
        expectedDelivery: data.expected_delivery,
        status: data.status,
        notes: data.notes,
        category: data.category,
        supplier: data.supplier,
        ordered: data.ordered,
        lpoReceived: data.lpo_received,
        invoiceStatus: data.invoice_status,
      };
      
      setOrders(prev => [newOrder, ...prev]);
      updateProjectStatus();
      
      toast({
        title: "Order Created",
        description: `${formData.name} has been added successfully`,
      });
      
      // Reset form and close dialog
      setFormData(initialFormData);
      setIsDialogOpen(false);
      
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };
  
  const updateOrderStatus = async (orderId: string, updates: Partial<OrderItem>) => {
    try {
      const dbUpdates: any = {};
      
      if ('ordered' in updates) dbUpdates.ordered = updates.ordered;
      if ('lpoReceived' in updates) dbUpdates.lpo_received = updates.lpoReceived;
      if ('lpoNumber' in updates) dbUpdates.lpo_number = updates.lpoNumber;
      if ('invoiceStatus' in updates) dbUpdates.invoice_status = updates.invoiceStatus;
      if ('actualDelivery' in updates) dbUpdates.actual_delivery = updates.actualDelivery;
      
      // Update in database
      const { error } = await supabase
        .from('orders')
        .update(dbUpdates)
        .eq('id', orderId);
        
      if (error) {
        console.error("Error updating order:", error);
        toast({
          title: "Error",
          description: "Failed to update order status",
          variant: "destructive",
        });
        return false;
      }
      
      // Update local state
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId ? { ...order, ...updates } : order
        )
      );
      
      // Update project status
      updateProjectStatus();
      
      toast({
        title: "Order Updated",
        description: "Order status has been updated successfully",
      });
      
      return true;
    } catch (error) {
      console.error("Error in updateOrderStatus:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const updateProjectStatus = async () => {
    try {
      const totalOrders = orders.length;
      const completedOrders = orders.filter(o => o.invoiceStatus === '100%').length;
      const completedLPOs = orders.filter(o => o.lpoReceived).length;
      
      // Calculate percentages
      const orderProgress = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;
      const lpoProgress = totalOrders > 0 ? Math.round((completedLPOs / totalOrders) * 100) : 0;
      
      // Update project status
      const { error } = await supabase
        .from('projects')
        .update({
          contractor_progress: orderProgress,
          owner_progress: lpoProgress
        })
        .eq('id', project.id);
        
      if (error) {
        console.error("Error updating project status:", error);
      }
    } catch (error) {
      console.error("Error in updateProjectStatus:", error);
    }
  };

  return (
    <section id="order-tracker" className="content-section">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <span className="mr-2">🧾</span> Order, LPO & Invoice Tracker
      </h2>
      
      <Card className="card-shadow">
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-lg">Order Tracking for {project.name}</CardTitle>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-1" />
                    Add New Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add New Item</DialogTitle>
                    <DialogDescription>
                      Add a new item to track in the order system.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">Item Name</label>
                        <Input 
                          id="name" 
                          name="name"
                          placeholder="Enter item name" 
                          value={formData.name} 
                          onChange={handleInputChange} 
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="category" className="text-sm font-medium">Category</label>
                        <Select 
                          value={formData.category} 
                          onValueChange={handleCategoryChange}
                        >
                          <SelectTrigger id="category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equipment">Equipment</SelectItem>
                            <SelectItem value="furniture">Furniture</SelectItem>
                            <SelectItem value="material">Material</SelectItem>
                            <SelectItem value="service">Service</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="quantity" className="text-sm font-medium">Quantity</label>
                        <Input 
                          id="quantity" 
                          name="quantity" 
                          type="number" 
                          placeholder="Enter quantity" 
                          value={formData.quantity} 
                          onChange={handleInputChange} 
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="supplier" className="text-sm font-medium">Supplier</label>
                        <Input 
                          id="supplier" 
                          name="supplier" 
                          placeholder="Enter supplier name" 
                          value={formData.supplier} 
                          onChange={handleInputChange} 
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Order Date</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !formData.orderDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.orderDate ? format(formData.orderDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={formData.orderDate}
                              onSelect={(date) => setFormData(prev => ({ ...prev, orderDate: date }))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Expected Delivery</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !formData.expectedDelivery && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.expectedDelivery ? format(formData.expectedDelivery, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={formData.expectedDelivery}
                              onSelect={(date) => setFormData(prev => ({ ...prev, expectedDelivery: date }))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="notes" className="text-sm font-medium">Notes</label>
                      <Textarea 
                        id="notes" 
                        name="notes" 
                        placeholder="Add any additional notes" 
                        value={formData.notes} 
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit}>Add Item</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Ordered</TableHead>
                  <TableHead>LPO Received</TableHead>
                  <TableHead>LPO Document</TableHead>
                  <TableHead>Invoice Status</TableHead>
                  <TableHead>Invoice Document</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredOrders && filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Badge variant="outline" className="bg-gray-100">
                          {order.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{order.name}</TableCell>
                      <TableCell>
                        <Badge variant={order.ordered ? "default" : "outline"} className={order.ordered ? "bg-green-500" : ""}>
                          {order.ordered ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={order.lpoReceived ? "default" : "outline"} className={order.lpoReceived ? "bg-blue-500" : ""}>
                          {order.lpoReceived ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {order.lpoReceived ? (
                          <Button variant="outline" size="sm" className="h-8">
                            <FileText className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        ) : (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="h-8">
                                <Upload className="h-3 w-3 mr-1" />
                                Upload
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Upload LPO Document</DialogTitle>
                                <DialogDescription>
                                  Upload an LPO document for {order.name}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div>
                                  <label className="block text-sm font-medium mb-1">LPO Number</label>
                                  <Input placeholder="Enter LPO number" />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-1">LPO Document</label>
                                  <Input type="file" />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button 
                                  onClick={() => {
                                    updateOrderStatus(order.id, { lpoReceived: true });
                                  }}
                                >
                                  Upload and Mark Received
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={order.invoiceStatus} 
                          onValueChange={(value) => updateOrderStatus(order.id, { invoiceStatus: value })}
                        >
                          <SelectTrigger className="h-8 w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0%">0%</SelectItem>
                            <SelectItem value="25%">25%</SelectItem>
                            <SelectItem value="50%">50%</SelectItem>
                            <SelectItem value="100%">100%</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {order.invoiceStatus !== '0%' ? (
                          <Button variant="outline" size="sm" className="h-8">
                            <FileText className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" className="h-8">
                            <Upload className="h-3 w-3 mr-1" />
                            Upload
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-8">
                          <Check className="h-3 w-3 mr-1" />
                          Update
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                      No orders found for this project.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
