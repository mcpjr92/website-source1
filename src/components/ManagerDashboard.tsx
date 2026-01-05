"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  Wrench, 
  DollarSign,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
  LogOut,
  UserCheck,
  UserX,
  Settings,
  BarChart3,
  Filter
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, User, WorkOrder, VendorApplication, Payment } from "@/lib/supabase";

export default function ManagerDashboard() {
  const { user, userProfile, signOut } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [applications, setApplications] = useState<VendorApplication[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [serviceFeePercentage, setServiceFeePercentage] = useState(15);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      // Fetch all users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;
      setUsers(usersData || []);

      // Fetch all work orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('work_orders')
        .select(`
          *,
          client:users!work_orders_client_id_fkey(full_name, company_name),
          vendor:users!work_orders_assigned_vendor_id_fkey(full_name, company_name)
        `)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      setWorkOrders(ordersData || []);

      // Fetch all applications
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('vendor_applications')
        .select(`
          *,
          vendor:users(full_name, company_name),
          work_order:work_orders(title)
        `)
        .order('created_at', { ascending: false });

      if (applicationsError) throw applicationsError;
      setApplications(applicationsData || []);

      // Fetch all payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (paymentsError) throw paymentsError;
      setPayments(paymentsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId: string, status: 'active' | 'suspended') => {
    try {
      await supabase
        .from('users')
        .update({ status })
        .eq('id', userId);

      fetchAllData();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const processPayment = async (workOrderId: string) => {
    try {
      const order = workOrders.find(wo => wo.id === workOrderId);
      if (!order || !order.total_amount || !order.assigned_vendor_id) return;

      const serviceFee = (order.total_amount * serviceFeePercentage) / 100;
      const vendorAmount = order.total_amount - serviceFee;

      // Create payment record
      await supabase
        .from('payments')
        .insert([{
          work_order_id: workOrderId,
          client_id: order.client_id,
          vendor_id: order.assigned_vendor_id,
          total_amount: order.total_amount,
          vendor_amount: vendorAmount,
          service_fee: serviceFee,
          status: 'completed'
        }]);

      // Update work order status
      await supabase
        .from('work_orders')
        .update({ 
          status: 'paid',
          vendor_amount: vendorAmount
        })
        .eq('id', workOrderId);

      fetchAllData();
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  const updateServiceFee = async (workOrderId: string, newFee: number) => {
    try {
      await supabase
        .from('work_orders')
        .update({ service_fee_percentage: newFee })
        .eq('id', workOrderId);

      fetchAllData();
    } catch (error) {
      console.error('Error updating service fee:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-purple-100 text-purple-800';
      case 'paid': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    totalUsers: users.length,
    clients: users.filter(u => u.user_type === 'client').length,
    vendors: users.filter(u => u.user_type === 'vendor').length,
    activeOrders: workOrders.filter(wo => ['open', 'assigned', 'in_progress'].includes(wo.status)).length,
    completedOrders: workOrders.filter(wo => ['completed', 'approved', 'paid'].includes(wo.status)).length,
    totalRevenue: payments.reduce((sum, p) => sum + (p.service_fee || 0), 0),
    pendingPayments: workOrders.filter(wo => wo.status === 'approved').length
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
                <p className="text-xs text-gray-500">Manager</p>
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
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                  <p className="text-xs text-gray-500">{stats.clients} clients, {stats.vendors} vendors</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Wrench className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeOrders}</p>
                  <p className="text-xs text-gray-500">{stats.completedOrders} completed</p>
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
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{stats.pendingPayments} pending payments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Service Fee</p>
                  <p className="text-2xl font-bold text-gray-900">{serviceFeePercentage}%</p>
                  <p className="text-xs text-gray-500">Default rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="orders">Work Orders</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Users Management */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage clients and vendors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {user.user_type === 'client' ? (
                            <Users className="h-5 w-5 text-gray-600" />
                          ) : (
                            <Wrench className="h-5 w-5 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.full_name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          {user.company_name && (
                            <p className="text-xs text-gray-500">{user.company_name}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`${user.user_type === 'client' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                          {user.user_type}
                        </Badge>
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                        <div className="flex gap-2">
                          {user.status === 'active' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateUserStatus(user.id, 'suspended')}
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateUserStatus(user.id, 'active')}
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Work Orders Management */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Work Orders Management</CardTitle>
                <CardDescription>Monitor and manage all work orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workOrders.map((order: any) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{order.title}</h3>
                          <p className="text-sm text-gray-600">
                            Client: {order.client?.full_name}
                            {order.vendor && ` | Vendor: ${order.vendor.full_name}`}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline">{order.category}</Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{order.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Created: {new Date(order.created_at).toLocaleDateString()}</span>
                          {order.total_amount && (
                            <span>Amount: ${order.total_amount}</span>
                          )}
                          <span>Service Fee: {order.service_fee_percentage}%</span>
                        </div>
                        
                        <div className="flex gap-2">
                          {order.status === 'approved' && (
                            <Button
                              size="sm"
                              onClick={() => processPayment(order.id)}
                            >
                              Process Payment
                            </Button>
                          )}
                          <Select
                            value={order.service_fee_percentage.toString()}
                            onValueChange={(value) => updateServiceFee(order.id, parseFloat(value))}
                          >
                            <SelectTrigger className="w-20 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10">10%</SelectItem>
                              <SelectItem value="15">15%</SelectItem>
                              <SelectItem value="20">20%</SelectItem>
                              <SelectItem value="25">25%</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Management */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment Management</CardTitle>
                <CardDescription>Track all payments and service fees</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Payment #{payment.id.slice(0, 8)}</p>
                        <p className="text-sm text-gray-600">
                          Work Order: {workOrders.find(wo => wo.id === payment.work_order_id)?.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">${payment.total_amount}</p>
                        <p className="text-sm text-gray-600">Vendor: ${payment.vendor_amount}</p>
                        <p className="text-sm text-green-600">Fee: ${payment.service_fee}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Configure platform-wide settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Service Fee Percentage
                    </label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        value={serviceFeePercentage}
                        onChange={(e) => setServiceFeePercentage(parseFloat(e.target.value))}
                        className="w-32"
                        min="0"
                        max="50"
                      />
                      <span className="text-sm text-gray-600">%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      This will be the default service fee for new work orders
                    </p>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-gray-900 mb-4">Platform Statistics</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700">Total Work Orders</p>
                        <p className="text-2xl font-bold text-gray-900">{workOrders.length}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700">Total Applications</p>
                        <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700">Success Rate</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {workOrders.length > 0 ? Math.round((stats.completedOrders / workOrders.length) * 100) : 0}%
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700">Avg. Service Fee</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {payments.length > 0 ? Math.round(payments.reduce((sum, p) => sum + (p.service_fee / p.total_amount * 100), 0) / payments.length) : 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}