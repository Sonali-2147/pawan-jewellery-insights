import { useState, useEffect, useMemo } from "react";
import { Plus, Download, Search, X, Filter, MapPin, Table, Pencil, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import CustomerMap from "@/components/maps/CustomerMap";
import { Customer, Purpose, CustomerFormData } from "@/types";
import { customerApi, purposeApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [purposeFilter, setPurposeFilter] = useState<number | undefined>();
  const [page, setPage] = useState(1);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [newCustomer, setNewCustomer] = useState<CustomerFormData>({
    name: "",
    mob_no: "",
    address: "",
    purpose: 1,
    whatsapp: "yes",
    notification: "yes",
    joining_date: new Date().toISOString().split("T")[0],
    staff_id: 1,
    latitude: null,
    longitude: null,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch customers
  const { data: customersData, isLoading, error } = useQuery({
    queryKey: ["customers", page, purposeFilter],
    queryFn: () => customerApi.getAll(page, 20, purposeFilter),
    retry: 1,
  });

  // Fetch purposes for filter
  const { data: purposesData } = useQuery({
    queryKey: ["purposes"],
    queryFn: () => purposeApi.getAll(),
    retry: 1,
  });

  // Create customer mutation
  const createMutation = useMutation({
    mutationFn: customerApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setIsAddOpen(false);
      resetForm();
      toast({ title: "Success", description: "Customer added successfully" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  // Update customer mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CustomerFormData> }) =>
      customerApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setEditingCustomer(null);
      resetForm();
      toast({ title: "Success", description: "Customer updated successfully" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  // Delete customer mutation
  const deleteMutation = useMutation({
    mutationFn: customerApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast({ title: "Deleted", description: "Customer deleted successfully" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setNewCustomer({
      name: "",
      mob_no: "",
      address: "",
      purpose: 1,
      whatsapp: "yes",
      notification: "yes",
      joining_date: new Date().toISOString().split("T")[0],
      staff_id: 1,
      latitude: null,
      longitude: null,
    });
  };

  const customers = customersData?.data || [];
  const purposes = purposesData?.data || [];
  const totalPages = customersData?.total_pages || 1;
  const totalRecords = customersData?.total || 0;

  // Enhance customers with purpose_name
  const enhancedCustomers = useMemo(() => {
    return customers.map((customer) => ({
      ...customer,
      purpose_name: purposes.find((p) => p.id === customer.purpose)?.purpose || `Purpose ${customer.purpose}`,
    }));
  }, [customers, purposes]);

  // Filter by search locally
  const filteredCustomers = enhancedCustomers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.mob_no.includes(searchTerm) ||
    customer.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const recentCustomers = filteredCustomers.slice(0, 3);

  const handleAddCustomer = () => {
    if (!newCustomer.name || !newCustomer.mob_no) {
      toast({ title: "Error", description: "Name and mobile are required", variant: "destructive" });
      return;
    }
    createMutation.mutate(newCustomer);
  };

  const handleUpdateCustomer = () => {
    if (!editingCustomer) return;
    updateMutation.mutate({ id: editingCustomer.id, data: newCustomer });
  };

  const openEditDialog = (customer: Customer) => {
    setEditingCustomer(customer);
    setNewCustomer({
      name: customer.name,
      mob_no: customer.mob_no,
      address: customer.address,
      purpose: customer.purpose,
      whatsapp: customer.whatsapp,
      notification: customer.notification,
      joining_date: customer.joining_date,
      staff_id: customer.staff_id,
      latitude: customer.latitude,
      longitude: customer.longitude,
    });
  };

  const handleExportExcel = () => {
    const headers = ["Name", "Mobile", "Address", "Purpose", "WhatsApp", "Notification", "Joining Date", "Latitude", "Longitude"];
    const csvContent = [
      headers.join(","),
      ...filteredCustomers.map((c) =>
        [c.name, c.mob_no, c.address, c.purpose_name, c.whatsapp, c.notification, c.joining_date, c.latitude, c.longitude].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customers.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: "Customer data exported successfully" });
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setNewCustomer({
            ...newCustomer,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          toast({ title: "Location captured", description: "GPS coordinates added" });
        },
        (error) => {
          toast({ title: "Error", description: "Could not get location", variant: "destructive" });
        }
      );
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Customers"
        subtitle="Manage your customer database"
        actions={
          <div className="flex gap-3">
            <Button onClick={handleExportExcel} variant="outline" className="border-border hover:bg-muted">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="btn-gold">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-display text-xl gold-gradient-text">Add New Customer</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <Input
                    placeholder="Customer Name *"
                    className="input-premium"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  />
                  <Input
                    placeholder="Mobile Number *"
                    className="input-premium"
                    value={newCustomer.mob_no}
                    onChange={(e) => setNewCustomer({ ...newCustomer, mob_no: e.target.value })}
                  />
                  <Input
                    placeholder="Address"
                    className="input-premium"
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  />
                  <select
                    className="input-premium w-full"
                    value={newCustomer.purpose}
                    onChange={(e) => setNewCustomer({ ...newCustomer, purpose: Number(e.target.value) })}
                  >
                    {purposes.map((p) => (
                      <option key={p.id} value={p.id}>{p.purpose}</option>
                    ))}
                  </select>
                  <Input
                    type="date"
                    className="input-premium"
                    value={newCustomer.joining_date}
                    onChange={(e) => setNewCustomer({ ...newCustomer, joining_date: e.target.value })}
                  />
                  <div className="flex items-center justify-between">
                    <Label className="text-foreground">WhatsApp</Label>
                    <Switch
                      checked={newCustomer.whatsapp === "yes"}
                      onCheckedChange={(checked) => setNewCustomer({ ...newCustomer, whatsapp: checked ? "yes" : "no" })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-foreground">Notifications</Label>
                    <Switch
                      checked={newCustomer.notification === "yes"}
                      onCheckedChange={(checked) => setNewCustomer({ ...newCustomer, notification: checked ? "yes" : "no" })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Latitude"
                      type="number"
                      step="any"
                      className="input-premium flex-1"
                      value={newCustomer.latitude || ""}
                      onChange={(e) => setNewCustomer({ ...newCustomer, latitude: e.target.value ? Number(e.target.value) : null })}
                    />
                    <Input
                      placeholder="Longitude"
                      type="number"
                      step="any"
                      className="input-premium flex-1"
                      value={newCustomer.longitude || ""}
                      onChange={(e) => setNewCustomer({ ...newCustomer, longitude: e.target.value ? Number(e.target.value) : null })}
                    />
                    <Button type="button" variant="outline" onClick={handleGetLocation} className="border-border hover:bg-muted">
                      <MapPin className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button onClick={handleAddCustomer} className="w-full btn-gold" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Adding..." : "Add Customer"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Recent Customers */}
      <div className="mb-8">
        <h3 className="text-lg font-display font-semibold text-foreground mb-4">Recently Added</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentCustomers.map((customer) => (
            <div key={customer.id} className="card-premium p-4 border-l-2 border-primary">
              <h4 className="font-semibold text-foreground">{customer.name}</h4>
              <p className="text-sm text-muted-foreground">{customer.mob_no}</p>
              <p className="text-xs text-primary mt-2">{customer.address}</p>
            </div>
          ))}
          {recentCustomers.length === 0 && !isLoading && (
            <p className="text-muted-foreground col-span-3">No customers found</p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or address..."
            className="input-premium pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative min-w-[150px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select
            className="input-premium pl-10 pr-4 appearance-none cursor-pointer w-full"
            value={purposeFilter || ""}
            onChange={(e) => setPurposeFilter(e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">All Purposes</option>
            {purposes.map((p) => (
              <option key={p.id} value={p.id}>{p.purpose}</option>
            ))}
          </select>
        </div>
        {(searchTerm || purposeFilter) && (
          <Button
            variant="ghost"
            onClick={() => { setSearchTerm(""); setPurposeFilter(undefined); }}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Tabs for Table/Map View */}
      <Tabs defaultValue="table" className="mb-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="table" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Table className="w-4 h-4 mr-2" />
            Table View
          </TabsTrigger>
          <TabsTrigger value="map" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <MapPin className="w-4 h-4 mr-2" />
            Map View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="table">
          {/* Customer Table */}
          <div className="card-premium overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table-premium">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Mobile</th>
                    <th>Address</th>
                    <th>Purpose</th>
                    <th>Joined</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td className="font-medium text-foreground">{customer.name}</td>
                      <td className="text-muted-foreground">{customer.mob_no}</td>
                      <td className="text-muted-foreground">{customer.address}</td>
                      <td>
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                          {customer.purpose_name}
                        </span>
                      </td>
                      <td className="text-muted-foreground">{customer.joining_date}</td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog open={editingCustomer?.id === customer.id} onOpenChange={(open) => !open && setEditingCustomer(null)}>
                            <DialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-muted" onClick={() => openEditDialog(customer)}>
                                <Pencil className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="font-display text-xl gold-gradient-text">Edit Customer</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 mt-4">
                                <Input
                                  placeholder="Customer Name *"
                                  className="input-premium"
                                  value={newCustomer.name}
                                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                />
                                <Input
                                  placeholder="Mobile Number *"
                                  className="input-premium"
                                  value={newCustomer.mob_no}
                                  onChange={(e) => setNewCustomer({ ...newCustomer, mob_no: e.target.value })}
                                />
                                <Input
                                  placeholder="Address"
                                  className="input-premium"
                                  value={newCustomer.address}
                                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                                />
                                <select
                                  className="input-premium w-full"
                                  value={newCustomer.purpose}
                                  onChange={(e) => setNewCustomer({ ...newCustomer, purpose: Number(e.target.value) })}
                                >
                                  {purposes.map((p) => (
                                    <option key={p.id} value={p.id}>{p.purpose}</option>
                                  ))}
                                </select>
                                <Input
                                  type="date"
                                  className="input-premium"
                                  value={newCustomer.joining_date}
                                  onChange={(e) => setNewCustomer({ ...newCustomer, joining_date: e.target.value })}
                                />
                                <div className="flex items-center justify-between">
                                  <Label className="text-foreground">WhatsApp</Label>
                                  <Switch
                                    checked={newCustomer.whatsapp === "yes"}
                                    onCheckedChange={(checked) => setNewCustomer({ ...newCustomer, whatsapp: checked ? "yes" : "no" })}
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <Label className="text-foreground">Notifications</Label>
                                  <Switch
                                    checked={newCustomer.notification === "yes"}
                                    onCheckedChange={(checked) => setNewCustomer({ ...newCustomer, notification: checked ? "yes" : "no" })}
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="Latitude"
                                    type="number"
                                    step="any"
                                    className="input-premium flex-1"
                                    value={newCustomer.latitude || ""}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, latitude: e.target.value ? Number(e.target.value) : null })}
                                  />
                                  <Input
                                    placeholder="Longitude"
                                    type="number"
                                    step="any"
                                    className="input-premium flex-1"
                                    value={newCustomer.longitude || ""}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, longitude: e.target.value ? Number(e.target.value) : null })}
                                  />
                                  <Button type="button" variant="outline" onClick={handleGetLocation} className="border-border hover:bg-muted">
                                    <MapPin className="w-4 h-4" />
                                  </Button>
                                </div>
                                <Button onClick={handleUpdateCustomer} className="w-full btn-gold" disabled={updateMutation.isPending}>
                                  {updateMutation.isPending ? "Updating..." : "Update Customer"}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-destructive/10 text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-card border-border">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-foreground">Delete Customer?</AlertDialogTitle>
                                <AlertDialogDescription>This will permanently delete "{customer.name}". This action cannot be undone.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-border hover:bg-muted">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteMutation.mutate(customer.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {isLoading && <div className="text-center py-8 text-muted-foreground">Loading...</div>}
            {error && <div className="text-center py-8 text-destructive">Error loading customers. Check API connection.</div>}
            {filteredCustomers.length === 0 && !isLoading && <div className="text-center py-8 text-muted-foreground">No customers found</div>}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages} ({totalRecords} total)
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="border-border hover:bg-muted">
                Previous
              </Button>
              <Button variant="outline" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="border-border hover:bg-muted">
                Next
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="map">
  {isLoading ? (
    <div className="h-[500px] flex items-center justify-center bg-card rounded-lg border border-border">
      <p className="text-muted-foreground animate-pulse">Loading map with customers...</p>
    </div>
  ) : error ? (
    <div className="h-[500px] flex items-center justify-center bg-card rounded-lg border border-destructive/30 text-destructive">
      Error loading map – check API connection
    </div>
  ) : (
    <>
      <CustomerMap 
        customers={filteredCustomers ?? []} 
        className="h-[500px]" 
      />
      <p className="text-sm text-muted-foreground mt-4">
        Showing {(filteredCustomers ?? []).filter(c => c.latitude && c.longitude).length} customers with location data on map
      </p>
    </>
  )}
</TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Customers;
