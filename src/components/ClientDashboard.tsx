"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  DollarSign,
  MapPin,
  Calendar,
  User,
  LogOut,
  Camera,
  Star
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, WorkOrder, VendorApplication } from "@/lib/supabase";

export default function ClientDashboard() {
  const { user, userProfile, signOut } = useAuth();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [applications, setApplications] = useState<VendorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [newOrder, setNewOrder] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium" as const,
    budget_min: "",
    budget_max: "",
    location: ""
  });

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const fetchWorkOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .select('*')
        .eq('client_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkOrders(data || []);
    } catch (error) {
      console.error('Error fetching work orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async (workOrderId: string) => {
    try {
      const { data, error } = await supabase
        .from('vendor_applications')
        .select(`
          *,
          vendor:users(full_name, company_name)
        `)
        .eq('work_order_id', workOrderId);

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const createWorkOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .insert([{
          ...newOrder,
          client_id: user?.id,
          budget_min: newOrder.budget_min ? parseFloat(newOrder.budget_min) : null,
          budget_max: newOrder.budget_max ? parseFloat(newOrder.budget_max) : null,
        }])
        .select()
        .single();

      if (error) throw error;

      setWorkOrders([data, ...workOrders]);
      setNewOrder({
        title: "",
        description: "",
        category: "",
        priority: "medium",
        budget_min: "",
        budget_max: "",
        location: ""
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating work order:', error);
    }
  };

  const acceptVendor = async (applicationId: string, workOrderId: string, vendorId: string) => {
    try {
      // Update application status
      await supabase
        .from('vendor_applications')
        .update({ status: 'accepted' })
        .eq('id', applicationId);

      // Update work order with assigned vendor
      await supabase
        .from('work_orders')
        .update({ 
          assigned_vendor_id: vendorId,
          status: 'assigned'
        })
        .eq('id', workOrderId);

      // Reject other applications
      await supabase
        .from('vendor_applications')
        .update({ status: 'rejected' })
        .eq('work_order_id', workOrderId)
        .neq('id', applicationId);

      fetchWorkOrders();
      fetchApplications(workOrderId);
    } catch (error) {
      console.error('Error accepting vendor:', error);
    }
  };

  const approveWork = async (workOrderId: string) => {
    try {
      await supabase
        .from('work_orders')
        .update({ status: 'approved' })
        .eq('id', workOrderId);

      fetchWorkOrders();
    } catch (error) {
      console.error('Error approving work:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-purple-100 text-purple-800';
      case 'paid': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SOURCE1 SOLUTIONS
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{userProfile?.full_name}</p>
                <p className="text-xs text-gray-500">Property Owner</p>
              </div>
              <Button variant="outline" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Open Orders</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {workOrders.filter(wo => wo.status === 'open').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {workOrders.filter(wo => ['assigned', 'in_progress'].includes(wo.status)).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {workOrders.filter(wo => ['completed', 'approved', 'paid'].includes(wo.status)).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${workOrders.filter(wo => wo.total_amount).reduce((sum, wo) => sum + (wo.total_amount || 0), 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Work Orders List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Work Orders</CardTitle>
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Order
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workOrders.map((order) => (
                    <div
                      key={order.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                        setSelectedOrder(order);
                        fetchApplications(order.id);
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{order.title}</h3>
                        <div className="flex gap-2">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={getPriorityColor(order.priority)}>
                            {order.priority}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{order.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {order.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                        {order.budget_max && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            ${order.budget_min} - ${order.budget_max}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Details / Create Form */}
          <div>
            {showCreateForm ? (
              <Card>
                <CardHeader>
                  <CardTitle>Create Work Order</CardTitle>
                  <CardDescription>Submit a new maintenance request</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={createWorkOrder} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title *
                      </label>
                      <Input
                        required
                        value={newOrder.title}
                        onChange={(e) => setNewOrder({...newOrder, title: e.target.value})}
                        placeholder="Brief description of work needed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <Select value={newOrder.category} onValueChange={(value) => setNewOrder({...newOrder, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="plumbing">Plumbing</SelectItem>
                          <SelectItem value="electrical">Electrical</SelectItem>
                          <SelectItem value="hvac">HVAC</SelectItem>
                          <SelectItem value="roofing">Roofing</SelectItem>
                          <SelectItem value="painting">Painting</SelectItem>
                          <SelectItem value="flooring">Flooring</SelectItem>
                          <SelectItem value="general">General Maintenance</SelectItem>
                          <SelectItem value="landscaping">Landscaping</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <Select value={newOrder.priority} onValueChange={(value: any) => setNewOrder({...newOrder, priority: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location *
                      </label>
                      <Input
                        required
                        value={newOrder.location}
                        onChange={(e) => setNewOrder({...newOrder, location: e.target.value})}
                        placeholder="Property address or location"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Min Budget
                        </label>
                        <Input
                          type="number"
                          value={newOrder.budget_min}
                          onChange={(e) => setNewOrder({...newOrder, budget_min: e.target.value})}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Max Budget
                        </label>
                        <Input
                          type="number"
                          value={newOrder.budget_max}
                          onChange={(e) => setNewOrder({...newOrder, budget_max: e.target.value})}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                      </label>
                      <Textarea
                        required
                        rows={4}
                        value={newOrder.description}
                        onChange={(e) => setNewOrder({...newOrder, description: e.target.value})}
                        placeholder="Detailed description of the work needed..."
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        Create Order
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : selectedOrder ? (
              <Card>
                <CardHeader>
                  <CardTitle>Order Details</CardTitle>
                  <CardDescription>{selectedOrder.title}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Status</p>
                      <Badge className={getStatusColor(selectedOrder.status)}>
                        {selectedOrder.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700">Description</p>
                      <p className="text-sm text-gray-600">{selectedOrder.description}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700">Location</p>
                      <p className="text-sm text-gray-600">{selectedOrder.location}</p>
                    </div>

                    {selectedOrder.budget_max && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Budget Range</p>
                        <p className="text-sm text-gray-600">
                          ${selectedOrder.budget_min} - ${selectedOrder.budget_max}
                        </p>
                      </div>
                    )}

                    {selectedOrder.status === 'completed' && (
                      <div className="pt-4 border-t">
                        <Button onClick={() => approveWork(selectedOrder.id)} className="w-full">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve Work
                        </Button>
                      </div>
                    )}

                    {/* Vendor Applications */}
                    {applications.length > 0 && (
                      <div className="pt-4 border-t">
                        <h4 className="font-medium text-gray-900 mb-3">Vendor Applications</h4>
                        <div className="space-y-3">
                          {applications.map((app: any) => (
                            <div key={app.id} className="border rounded-lg p-3">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-medium text-gray-900">{app.vendor.full_name}</p>
                                  {app.vendor.company_name && (
                                    <p className="text-sm text-gray-600">{app.vendor.company_name}</p>
                                  )}
                                </div>
                                <Badge className={app.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                  {app.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">${app.proposal_amount}</p>
                              <p className="text-xs text-gray-500 mb-3">{app.proposal_notes}</p>
                              {app.status === 'pending' && selectedOrder.status === 'open' && (
                                <Button
                                  size="sm"
                                  onClick={() => acceptVendor(app.id, selectedOrder.id, app.vendor_id)}
                                >
                                  Accept Proposal
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">Select a work order to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}