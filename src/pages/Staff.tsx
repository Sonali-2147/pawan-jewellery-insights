import { useState } from "react";
import { Plus, Pencil, Trash2, Phone, Mail, UserCircle, Search } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { staffApi } from "@/services/api";
import { Staff as StaffType } from "@/types";
import { useToast } from "@/hooks/use-toast";

const Staff = () => {
  const [searchMobile, setSearchMobile] = useState("");
  const [foundStaff, setFoundStaff] = useState<StaffType | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleSearchStaff = async () => {
    if (!searchMobile) {
      toast({ title: "Error", description: "Enter mobile number", variant: "destructive" });
      return;
    }

    setIsSearching(true);
    try {
      const response = await staffApi.getByMobile(searchMobile);
      if (response.status === "success" && response.data) {
        setFoundStaff(response.data);
        toast({ title: "Found", description: "Staff member found" });
      } else {
        setFoundStaff(null);
        toast({ title: "Not Found", description: "No staff with this mobile", variant: "destructive" });
      }
    } catch (error) {
      setFoundStaff(null);
      toast({ title: "Error", description: "Could not search staff. Check API connection.", variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  const roleColors: Record<string, string> = {
    Manager: "bg-primary/20 text-primary",
    "Sales Executive": "bg-success/20 text-success",
    Accountant: "bg-warning/20 text-warning",
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Staff"
        subtitle="Search and view staff members"
      />

      {/* Search Staff */}
      <div className="card-premium p-6 mb-8">
        <h3 className="text-lg font-display font-semibold text-foreground mb-4">Search Staff by Mobile</h3>
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Enter mobile number (e.g., 9876543210)"
              className="input-premium pl-10"
              value={searchMobile}
              onChange={(e) => setSearchMobile(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchStaff()}
            />
          </div>
          <Button onClick={handleSearchStaff} className="btn-gold" disabled={isSearching}>
            <Search className="w-4 h-4 mr-2" />
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </div>

        {/* Found Staff Card */}
        {foundStaff && (
          <div className="mt-6 p-6 bg-muted/30 rounded-lg border border-primary/30">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <UserCircle className="w-10 h-10 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-display font-semibold text-foreground">{foundStaff.name}</h4>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    {foundStaff.mob_no}
                  </div>
                  <p className="text-muted-foreground">{foundStaff.address}</p>
                  <p className="text-sm text-primary">Joined: {foundStaff.joining_date}</p>
                  {foundStaff.leaving_date && (
                    <p className="text-sm text-destructive">Left: {foundStaff.leaving_date}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  ID: {foundStaff.id}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="card-premium p-6">
        <h3 className="text-lg font-display font-semibold text-foreground mb-4">Staff Management</h3>
        <div className="text-muted-foreground space-y-2">
          <p>The StocksGPT API currently supports searching staff by mobile number.</p>
          <p>Use the search above to find staff details including:</p>
          <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
            <li>Staff ID (for customer assignments)</li>
            <li>Name and contact information</li>
            <li>Joining and leaving dates</li>
          </ul>
          <p className="mt-4 text-sm">
            <span className="text-primary">Note:</span> Full CRUD operations for staff would require additional API endpoints.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Staff;
