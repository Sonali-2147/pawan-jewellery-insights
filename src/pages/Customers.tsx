import { useState } from "react";
import { Plus, Download, Search, X, Filter } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { mockCustomers } from "@/data/mockData";
import { Customer } from "@/types";
import { useToast } from "@/hooks/use-toast";

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
  });
  const { toast } = useToast();

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = cityFilter === "" || customer.city.toLowerCase().includes(cityFilter.toLowerCase());
    return matchesSearch && matchesCity;
  });

  const recentCustomers = [...customers]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 3);

  const handleAddCustomer = () => {
    if (!newCustomer.name || !newCustomer.phone) {
      toast({
        title: "Error",
        description: "Name and phone are required",
        variant: "destructive",
      });
      return;
    }

    const customer: Customer = {
      id: Date.now().toString(),
      ...newCustomer,
      createdAt: new Date(),
    };

    setCustomers([customer, ...customers]);
    setNewCustomer({ name: "", phone: "", email: "", address: "", city: "" });
    setIsAddOpen(false);
    toast({
      title: "Success",
      description: "Customer added successfully",
    });
  };

  const handleExportExcel = () => {
    const headers = ["Name", "Phone", "Email", "Address", "City", "Created At"];
    const csvContent = [
      headers.join(","),
      ...filteredCustomers.map((c) =>
        [c.name, c.phone, c.email, c.address, c.city, c.createdAt.toLocaleDateString()].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customers.csv";
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exported",
      description: "Customer data exported successfully",
    });
  };

  const uniqueCities = [...new Set(customers.map((c) => c.city))];

  return (
    <DashboardLayout>
      <PageHeader
        title="Customers"
        subtitle="Manage your customer database"
        actions={
          <div className="flex gap-3">
            <Button onClick={handleExportExcel} variant="outline" className="border-border hover:bg-muted">
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="btn-gold">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="font-display text-xl gold-gradient-text">
                    Add New Customer
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <Input
                    placeholder="Customer Name *"
                    className="input-premium"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  />
                  <Input
                    placeholder="Phone Number *"
                    className="input-premium"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  />
                  <Input
                    placeholder="Email"
                    className="input-premium"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  />
                  <Input
                    placeholder="Address"
                    className="input-premium"
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  />
                  <Input
                    placeholder="City"
                    className="input-premium"
                    value={newCustomer.city}
                    onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                  />
                  <Button onClick={handleAddCustomer} className="w-full btn-gold">
                    Add Customer
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
              <p className="text-sm text-muted-foreground">{customer.phone}</p>
              <p className="text-xs text-primary mt-2">{customer.city}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or email..."
            className="input-premium pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative min-w-[150px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select
            className="input-premium pl-10 pr-4 appearance-none cursor-pointer w-full"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
          >
            <option value="">All Cities</option>
            {uniqueCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
        {(searchTerm || cityFilter) && (
          <Button
            variant="ghost"
            onClick={() => {
              setSearchTerm("");
              setCityFilter("");
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Customer Table */}
      <div className="card-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-premium">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Address</th>
                <th>City</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td className="font-medium text-foreground">{customer.name}</td>
                  <td className="text-muted-foreground">{customer.phone}</td>
                  <td className="text-muted-foreground">{customer.email}</td>
                  <td className="text-muted-foreground">{customer.address}</td>
                  <td>
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                      {customer.city}
                    </span>
                  </td>
                  <td className="text-muted-foreground">{customer.createdAt.toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredCustomers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">No customers found</div>
        )}
      </div>

      <p className="text-sm text-muted-foreground mt-4">
        Showing {filteredCustomers.length} of {customers.length} customers
      </p>
    </DashboardLayout>
  );
};

export default Customers;
