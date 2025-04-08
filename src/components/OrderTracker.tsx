
import { useState } from "react";
import { Check, FileText, Plus, Upload } from "lucide-react";
import { Project, OrderItem } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

interface OrderTrackerProps {
  project: Project;
  orders: OrderItem[];
}

export function OrderTracker({ project, orders }: OrderTrackerProps) {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  const categories = ['all', ...new Set(orders.map(order => order.category))];
  
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

  return (
    <section id="order-tracker" className="content-section">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <span className="mr-2">🧾</span> Order, LPO & Invoice Tracker
      </h2>
      
      <Card className="card-shadow">
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-lg">Order Tracking</CardTitle>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button>
                <Plus className="h-4 w-4 mr-1" />
                Add New Item
              </Button>
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
                {filteredOrders.length > 0 ? (
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
                          <Button variant="outline" size="sm" className="h-8">
                            <Upload className="h-3 w-3 mr-1" />
                            Upload
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getInvoiceStatusColor(order.invoiceStatus)}>
                          {order.invoiceStatus}
                        </Badge>
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
                      No orders found for the selected category.
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
