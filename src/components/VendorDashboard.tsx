"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
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
  Star,
  Send,
  Upload
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, WorkOrder, VendorApplication } from "@/lib/supabase";

export default function VendorDashboard() {
  const { user, userProfile, signOut } = useAuth();
  const [availableOrders, setAvailableOrders] = useState<WorkOrder[]>([]);
  const [myApplications, setMyApplications] = useState<VendorApplication[]>([]);
  const [assignedOrders, setAssignedOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [application, setApplication] = useState({
    proposal_amount: "",
    estimated_completion: "",
    proposal_notes: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch available work orders (open status)
      const { data: available, error: availableError } = await supabase
        .from('work_orders')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (availableError) throw availableError;
      setAvailableOrders(available || []);

      // Fetch my applications
      const { data: applications, error: applicationsError } = await supabase
        .from('vendor_applications')
        .select(`
          *,
          work_order:work_orders(*)
        `)
        .eq('vendor_id', user?.id);

      if (applicationsError) throw applicationsError;
      setMyApplications(applications || []);

      // Fetch assigned orders
      const { data: assigned, error: assignedError } = await supabase
        .from('work_orders')
        .select('*')
        .eq('assigned_vendor_id', user?.id)
        .order('created_at', { ascending: false });

      if (assignedError) throw assignedError;
      setAssignedOrders(assigned || []);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      const { data, error } = await supabase
        .from('vendor_applications')
        .insert([{
          work_order_id: selectedOrder.id,
          vendor_id: user?.id,
          proposal_amount: parseFloat(application.proposal_amount),
          estimated_completion: application.estimated_completion,
          proposal_notes: application.proposal_notes
        }]);

      if (error) throw error;

      setApplication({
        proposal_amount: "",
        estimated_completion: "",
        proposal_notes: ""
      });
      setShowApplicationForm(false);
      setSelectedOrder(null);
      fetchData();
    } catch (error) {
      console.error('Error submitting application:', error);
    }
  };

  const markInProgress = async (orderId: string) => {
    try {
      await supabase
        .from('work_orders')
        .update({ status: 'in_progress' })
        .eq('id', orderId);

      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const markCompleted = async (orderId: string, completionNotes: string) => {
    try {
      await supabase
        .from('work_orders')
        .update({ 
          status: 'completed',
          completion_notes: completionNotes
        })
        .eq('id', orderId);

      fetchData();
    } catch (error) {
      console.error('Error marking completed:', error);
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
                <p className="text-xs text-gray-500">Vendor</p>
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
                  <Search className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Available Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{availableOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Send className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{myApplications.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {assignedOrders.filter(order => ['assigned', 'in_progress'].includes(order.status)).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${assignedOrders.filter(order => order.vendor_amount).reduce((sum, order) => sum + (order.vendor_amount || 0), 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="available" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="available">Available Orders</TabsTrigger>
            <TabsTrigger value="applications">My Applications</TabsTrigger>
            <TabsTrigger value="assigned">Assigned Jobs</TabsTrigger>
          </TabsList>

          {/* Available Orders */}
          <TabsContent value="available">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Available Work Orders</CardTitle>
                    <CardDescription>Browse and apply for new opportunities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {availableOrders.map((order) => (
                        <div
                          key={order.id}
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-gray-900">{order.title}</h3>
                            <div className="flex gap-2">
                              <Badge className={getPriorityColor(order.priority)}>
                                {order.priority}
                              </Badge>
                              <Badge variant="outline">{order.category}</Badge>
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

              {/* Order Details / Application Form */}
              <div>
                {selectedOrder && !showApplicationForm ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Order Details</CardTitle>
                      <CardDescription>{selectedOrder.title}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Category</p>
                          <p className="text-sm text-gray-600">{selectedOrder.category}</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-700">Priority</p>
                          <Badge className={getPriorityColor(selectedOrder.priority)}>
                            {selectedOrder.priority}
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

                        <Button 
                          onClick={() => setShowApplicationForm(true)}
                          className="w-full"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Apply for This Job
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : showApplicationForm && selectedOrder ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Submit Application</CardTitle>
                      <CardDescription>Apply for: {selectedOrder.title}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={submitApplication} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Proposal Amount *
                          </label>
                          <Input
                            type="number"
                            required
                            value={application.proposal_amount}
                            onChange={(e) => setApplication({...application, proposal_amount: e.target.value})}
                            placeholder="Enter your quote"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Estimated Completion *
                          </label>
                          <Input
                            type="date"
                            required
                            value={application.estimated_completion}
                            onChange={(e) => setApplication({...application, estimated_completion: e.target.value})}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Proposal Notes
                          </label>
                          <Textarea
                            rows={4}
                            value={application.proposal_notes}
                            onChange={(e) => setApplication({...application, proposal_notes: e.target.value})}
                            placeholder="Describe your approach, experience, and why you're the best choice..."
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button type="submit" className="flex-1">
                            Submit Application
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => {
                              setShowApplicationForm(false);
                              setSelectedOrder(null);
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
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
          </TabsContent>

          {/* My Applications */}
          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>My Applications</CardTitle>
                <CardDescription>Track your submitted proposals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myApplications.map((app: any) => (
                    <div key={app.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{app.work_order.title}</h3>
                        <Badge className={app.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                                        app.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                        'bg-yellow-100 text-yellow-800'}>
                          {app.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{app.work_order.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          ${app.proposal_amount}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Est. completion: {new Date(app.estimated_completion).toLocaleDateString()}
                        </div>
                      </div>
                      {app.proposal_notes && (
                        <p className="text-xs text-gray-600">{app.proposal_notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assigned Jobs */}
          <TabsContent value="assigned">
            <Card>
              <CardHeader>
                <CardTitle>Assigned Jobs</CardTitle>
                <CardDescription>Manage your active work orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assignedOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{order.title}</h3>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{order.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {order.location}
                        </div>
                        {order.total_amount && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            ${order.total_amount}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {order.status === 'assigned' && (
                          <Button size="sm" onClick={() => markInProgress(order.id)}>
                            Start Work
                          </Button>
                        )}
                        {order.status === 'in_progress' && (
                          <Button 
                            size="sm" 
                            onClick={() => {
                              const notes = prompt("Add completion notes:");
                              if (notes) markCompleted(order.id, notes);
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}