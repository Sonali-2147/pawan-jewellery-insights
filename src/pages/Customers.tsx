import { useState, useEffect, useMemo } from "react";
import { Plus, Download, Search, X, Filter, MapPin, Table, Pencil, Trash2, Calendar as CalendarIcon, UserCircle } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import CustomerMap from "@/components/maps/CustomerMap";
import { Customer, Purpose, CustomerFormData } from "@/types";
import { customerApi, purposeApi, staffApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Helper function to parse date string and avoid timezone issues
const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Helper function to format date to YYYY-MM-DD
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [purposeFilter, setPurposeFilter] = useState<number | undefined>();
  const [staffFilter, setStaffFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<Date | undefined>();
  const [page, setPage] = useState(1);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [downloadStartDate, setDownloadStartDate] = useState<Date | undefined>();
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
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
    added_from_latitude: null,
    added_from_longitude: null,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, purposeFilter, staffFilter, dateFilter]);

  // Fetch customers using filter endpoint
  const { data: customersData, isLoading, error } = useQuery({
    queryKey: ["customers", searchTerm, purposeFilter, staffFilter, dateFilter],
    queryFn: () => {
      const filters: any = {};
      if (purposeFilter) filters.purpose_id = purposeFilter;
      if (staffFilter && !isNaN(Number(staffFilter))) filters.staff_id = Number(staffFilter);
      if (dateFilter) {
        const formattedDate = formatDate(dateFilter);
        filters.start_date = formattedDate; // Use start_date for API range filtering
      }
      
      // Always get all data for client-side pagination
      const limit = dateFilter || purposeFilter || staffFilter ? 100 : 30;
      
      // If we have filters, use the filter endpoint, otherwise use getAll
      if (Object.keys(filters).length > 0) {
        return customerApi.filter(1, limit, filters);
      } else {
        return customerApi.getAll(1, limit);
      }
    },
    retry: 1,
  });

  // Fetch purposes for filter
  const { data: purposesData } = useQuery({
    queryKey: ["purposes"],
    queryFn: () => purposeApi.getAll(),
    retry: 1,
  });

  // Fetch staff for filter
  const { data: staffData } = useQuery({
    queryKey: ["staff"],
    queryFn: () => staffApi.getAll(),
    retry: 1,
  });

  // Create customer mutation
  const createMutation = useMutation({
    mutationFn: customerApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setPage(1); // Reset to first page to show newly added customer
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
      setPage(1); // Reset to first page after update
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
      added_from_latitude: null,
      added_from_longitude: null,
    });
  };

  const customers = customersData?.data || [];
  const purposes = purposesData?.data || [];
  const staffs = staffData?.data || [];
  const totalPages = customersData?.total_pages || 1;
  const totalRecords = customersData?.total || 0;

  // Enhance customers with purpose_name and staff_name
  const enhancedCustomers = useMemo(() => {
    return customers.map((customer) => ({
      ...customer,
      purpose_name: purposes.find((p) => p.id === customer.purpose)?.purpose || `Purpose ${customer.purpose}`,
      staff_name: staffs.find((s) => s.id === customer.staff_id)?.name || `Staff ${customer.staff_id}`,
    }));
  }, [customers, purposes, staffs]);

  // Apply client-side search filter and date range filter (other filters are handled by API)
  const filteredCustomers = enhancedCustomers.filter((customer) => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.mob_no.includes(searchTerm) ||
      customer.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Date filter: show customers from selected date onwards (not exact match)
    let matchesDate = true;
    if (dateFilter) {
      const selectedDate = formatDate(dateFilter);
      matchesDate = customer.joining_date >= selectedDate;
      
      // Debug logging for first few customers
      if (enhancedCustomers.indexOf(customer) < 5) {
        console.log('Date filter debug:', {
          customerName: customer.name,
          customerDate: customer.joining_date,
          selectedDate: selectedDate,
          matchesDate: matchesDate,
          comparison: `${customer.joining_date} >= ${selectedDate}`
        });
      }
    }
    
    return matchesSearch && matchesDate;
  });

  // Calculate filtered pagination
  const itemsPerPage = 30;
  const totalFilteredPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Use API filtered count if available, otherwise use client-side count
  const apiFilteredCount = (customersData as any)?.analytics?.total_customers || filteredCustomers.length;

  const recentCustomers = filteredCustomers.slice(0, 3);

  const handleAddCustomer = () => {
    if (!newCustomer.name || !newCustomer.mob_no) {
      toast({ title: "Error", description: "Name and mobile are required", variant: "destructive" });
      return;
    }
    createMutation.mutate({
      ...newCustomer,
      staff_id: String(newCustomer.staff_id),
      purpose: String(newCustomer.purpose),
    } as any);
  };

  const handleUpdateCustomer = () => {
    if (!editingCustomer) return;
    updateMutation.mutate({
      id: editingCustomer.id,
      data: {
        ...newCustomer,
        staff_id: String(newCustomer.staff_id),
        purpose: String(newCustomer.purpose),
      } as any,
    });
    setPage(1); // Reset to first page after update
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
      added_from_latitude: customer.added_from_latitude,
      added_from_longitude: customer.added_from_longitude,
    });
  };

  const handleExportExcel = async () => {
    try {
      setIsDownloadOpen(false);
      toast({ title: "Exporting", description: "Preparing filtered records..." });
      
      // Fetch data based on selected start date
      const filters: any = {};
      if (downloadStartDate) {
        filters.start_date = formatDate(downloadStartDate);
      }
      
      // Implement paginated export to get all records
      let allCustomers: any[] = [];
      let page = 1;
      let hasMoreData = true;
      
      console.log('Starting paginated export...');
      
      while (hasMoreData) {
        const limit = 100; // API limit per page
        const exportData = Object.keys(filters).length > 0 
          ? await customerApi.filter(page, limit, filters)
          : await customerApi.getAll(page, limit);
        
        const customers = exportData?.data || [];
        allCustomers = [...allCustomers, ...customers];
        
        console.log(`Page ${page}: Got ${customers.length} customers, total so far: ${allCustomers.length}`);
        console.log('API response:', {
          currentPage: exportData?.page,
          totalPages: exportData?.total_pages,
          totalRecords: exportData?.total
        });
        
        // Check if there are more records
        // Continue if we got a full page (100 records) or if API indicates more pages
        hasMoreData = customers.length === limit;
        console.log(`Pagination check: got ${customers.length} records, limit is ${limit}, hasMoreData: ${hasMoreData}`);
        page++;
        
        // Safety check to prevent infinite loops
        if (page > 50) {
          console.log('Safety limit reached, stopping pagination');
          break;
        }
      }
      
      console.log(`Export complete: ${allCustomers.length} total customers fetched`);
      
      if (allCustomers.length === 0) {
        toast({ title: "No Data", description: "No customers found for selected date", variant: "destructive" });
        return;
      }

      // Enhance with purpose and staff names
      const enhancedExportData = allCustomers.map((customer) => ({
        ...customer,
        purpose_name: purposes.find((p) => p.id === customer.purpose)?.purpose || `Purpose ${customer.purpose}`,
        staff_name: staffs.find((s) => s.id === customer.staff_id)?.name || `Staff ${customer.staff_id}`,
      }));

      // Build CSV with proper escaping
      const escapeCSV = (value: any) => {
        if (value === null || value === undefined) return "";
        const strValue = String(value);
        if (strValue.includes(",") || strValue.includes('"') || strValue.includes("\n")) {
          return `"${strValue.replace(/"/g, '""')}"`;
        }
        return strValue;
      };

      const headers = ["Name", "Mobile", "Address", "Purpose", "Staff", "WhatsApp", "Notification", "Joining Date", "Latitude", "Longitude"];
      const csvRows = [
        headers.map(h => escapeCSV(h)).join(","),
        ...enhancedExportData.map((c) =>
          [
            escapeCSV(c.name),
            escapeCSV(c.mob_no),
            escapeCSV(c.address),
            escapeCSV(c.purpose_name),
            escapeCSV(c.staff_name),
            escapeCSV(c.whatsapp),
            escapeCSV(c.notification),
            escapeCSV(c.joining_date),
            escapeCSV(c.latitude),
            escapeCSV(c.longitude)
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvRows], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      
      link.setAttribute("href", url);
      const dateRange = downloadStartDate 
        ? `from_${formatDate(downloadStartDate)}`
        : "all";
      link.setAttribute("download", `customers_${dateRange}.csv`);
      link.style.visibility = "hidden";
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
      toast({ title: "Success", description: `Exported ${allCustomers.length} customers successfully` });
    } catch (err) {
      console.error("Export error:", err);
      toast({ title: "Error", description: "Failed to export data", variant: "destructive" });
    }
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

  const handleGetStaffLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setNewCustomer({
            ...newCustomer,
            added_from_latitude: position.coords.latitude,
            added_from_longitude: position.coords.longitude,
          });
          toast({ title: "Staff location captured", description: "Staff added from this location" });
        },
        (error) => {
          toast({ title: "Error", description: "Could not get staff location", variant: "destructive" });
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
          <Dialog open={isDownloadOpen} onOpenChange={setIsDownloadOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-border hover:bg-muted">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display text-xl gold-gradient-text">Export Customer Data</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Select Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${
                          !downloadStartDate ? "text-muted-foreground" : ""
                        } border-border hover:bg-muted`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {downloadStartDate ? formatDate(downloadStartDate) : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-black border-yellow-500" align="start">
                      <Calendar
                        mode="single"
                        selected={downloadStartDate}
                        onSelect={(date) => setDownloadStartDate(date)}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        className="border-0"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDownloadStartDate(undefined);
                    }}
                    className="flex-1"
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={handleExportExcel}
                    className="flex-1 btn-gold"
                  >
                    Export
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
                  <select
                    className="input-premium w-full"
                    value={newCustomer.staff_id}
                    onChange={(e) => setNewCustomer({ ...newCustomer, staff_id: Number(e.target.value) })}
                  >
                    {staffs.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  {/* Calendar Picker for Joining Date */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${
                          !newCustomer.joining_date ? "text-muted-foreground" : ""
                        } border-border hover:bg-muted`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newCustomer.joining_date ? newCustomer.joining_date : "Pick joining date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-black border-yellow-500" align="start">
                      <Calendar
                        mode="single"
                        selected={newCustomer.joining_date ? parseLocalDate(newCustomer.joining_date) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            setNewCustomer({
                              ...newCustomer,
                              joining_date: formatDate(date),
                            });
                          }
                        }}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        className="border-0"
                      />
                    </PopoverContent>
                  </Popover>
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
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Staff Location (Where Added From)</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Added From Latitude"
                        type="number"
                        step="any"
                        className="input-premium flex-1"
                        value={newCustomer.added_from_latitude || ""}
                        onChange={(e) => setNewCustomer({ ...newCustomer, added_from_latitude: e.target.value ? Number(e.target.value) : null })}
                      />
                      <Input
                        placeholder="Added From Longitude"
                        type="number"
                        step="any"
                        className="input-premium flex-1"
                        value={newCustomer.added_from_longitude || ""}
                        onChange={(e) => setNewCustomer({ ...newCustomer, added_from_longitude: e.target.value ? Number(e.target.value) : null })}
                      />
                      <Button type="button" variant="outline" onClick={handleGetStaffLocation} className="border-border hover:bg-muted" title="Capture current location">
                        <MapPin className="w-4 h-4" />
                      </Button>
                    </div>
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
        <div className="relative min-w-[200px]">
          <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search staff by name or ID..."
            className="input-premium pl-10"
            value={staffFilter}
            onChange={(e) => setStaffFilter(e.target.value)}
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`border-border hover:bg-muted ${!dateFilter ? "text-muted-foreground" : ""}`}
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              {dateFilter ? formatDate(dateFilter) : "Filter by Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-black border-yellow-500" align="start">
            <Calendar
              mode="single"
              selected={dateFilter}
              onSelect={(date) => setDateFilter(date)}
              disabled={(date) =>
                date > new Date() || date < new Date("1900-01-01")
              }
              className="border-0"
            />
          </PopoverContent>
        </Popover>
        {(searchTerm || purposeFilter || staffFilter || dateFilter) && (
          <Button
            variant="ghost"
            onClick={() => { setSearchTerm(""); setPurposeFilter(undefined); setStaffFilter(""); setDateFilter(undefined); setPage(1); }}
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
                    <th>Staff</th>
                    <th>Joined</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td className="font-medium text-foreground">{customer.name}</td>
                      <td className="text-muted-foreground">{customer.mob_no}</td>
                      <td className="text-muted-foreground">{customer.address}</td>
                      <td>
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                          {customer.purpose_name}
                        </span>
                      </td>
                      <td className="text-muted-foreground text-sm">{customer.staff_name}</td>
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
                                <select
                                  className="input-premium w-full"
                                  value={newCustomer.staff_id}
                                  onChange={(e) => setNewCustomer({ ...newCustomer, staff_id: Number(e.target.value) })}
                                >
                                  {staffs.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                  ))}
                                </select>
                                {/* Calendar Picker for Joining Date */}
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className={`w-full justify-start text-left font-normal ${
                                        !newCustomer.joining_date ? "text-muted-foreground" : ""
                                      } border-border hover:bg-muted`}
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {newCustomer.joining_date ? newCustomer.joining_date : "Pick joining date"}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0 bg-black border-yellow-500" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={newCustomer.joining_date ? parseLocalDate(newCustomer.joining_date) : undefined}
                                      onSelect={(date) => {
                                        if (date) {
                                          setNewCustomer({
                                            ...newCustomer,
                                            joining_date: formatDate(date),
                                          });
                                        }
                                      }}
                                      disabled={(date) =>
                                        date > new Date() || date < new Date("1900-01-01")
                                      }
                                      className="border-0"
                                    />
                                  </PopoverContent>
                                </Popover>
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
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium text-foreground">Staff Location (Where Added From)</Label>
                                  <div className="flex gap-2">
                                    <Input
                                      placeholder="Added From Latitude"
                                      type="number"
                                      step="any"
                                      className="input-premium flex-1"
                                      value={newCustomer.added_from_latitude || ""}
                                      onChange={(e) => setNewCustomer({ ...newCustomer, added_from_latitude: e.target.value ? Number(e.target.value) : null })}
                                    />
                                    <Input
                                      placeholder="Added From Longitude"
                                      type="number"
                                      step="any"
                                      className="input-premium flex-1"
                                      value={newCustomer.added_from_longitude || ""}
                                      onChange={(e) => setNewCustomer({ ...newCustomer, added_from_longitude: e.target.value ? Number(e.target.value) : null })}
                                    />
                                    <Button type="button" variant="outline" onClick={handleGetStaffLocation} className="border-border hover:bg-muted" title="Capture current location">
                                      <MapPin className="w-4 h-4" />
                                    </Button>
                                  </div>
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
            {paginatedCustomers.length === 0 && !isLoading && <div className="text-center py-8 text-muted-foreground">No customers found</div>}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalFilteredPages} ({filteredCustomers.length} filtered, {apiFilteredCount} total)
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="border-border hover:bg-muted">
                Previous
              </Button>
              <Button variant="outline" onClick={() => setPage(Math.min(totalFilteredPages, page + 1))} disabled={page === totalFilteredPages} className="border-border hover:bg-muted">
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
