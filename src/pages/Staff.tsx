import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Phone,
  UserCircle,
  Search,
  Filter,
  Calendar as CalendarIcon,
} from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { staffApi } from "@/services/api";
import { Staff as StaffType } from "@/types";
import { useToast } from "@/hooks/use-toast";

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

const Staff = () => {
  const { toast } = useToast();

  // 🔍 Search State
  const [searchMobile, setSearchMobile] = useState<string>("");
  const [foundStaff, setFoundStaff] = useState<StaffType | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // 📋 Filter State
  const [filterName, setFilterName] = useState<string>("");
  const [filterMobile, setFilterMobile] = useState<string>("");
  const [filterDate, setFilterDate] = useState<string>("");
  const [filteredStaffs, setFilteredStaffs] = useState<StaffType[]>([]);
  const [isFiltering, setIsFiltering] = useState<boolean>(false);

  // 📊 All Staff Table State
  const [allStaffs, setAllStaffs] = useState<StaffType[]>([]);
  const [isLoadingAllStaffs, setIsLoadingAllStaffs] = useState<boolean>(true);

  // ➕ Add Staff Form State
  const [staffForm, setStaffForm] = useState<{
    name: string;
    mob_no: string;
    address: string;
    joining_date: string;
  }>({
    name: "",
    mob_no: "",
    address: "",
    joining_date: "",
  });
  const [isAddingStaff, setIsAddingStaff] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  // 📊 Fetch all staff on component mount
  useEffect(() => {
    const fetchAllStaffs = async (): Promise<void> => {
      try {
        const res = await staffApi.getAll();
        if (res?.status === "success" && res?.data) {
          setAllStaffs(res.data);
        }
      } catch (err) {
        console.error("Error fetching staff:", err);
        toast({
          title: "Error",
          description: "Unable to load staff",
          variant: "destructive",
        });
      } finally {
        setIsLoadingAllStaffs(false);
      }
    };

    fetchAllStaffs();
  }, []);

  // 🔍 Search handler
  const handleSearchStaff = async (): Promise<void> => {
    const mobile = searchMobile.trim();

    if (!mobile) {
      toast({
        title: "Error",
        description: "Enter mobile number",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setFoundStaff(null);

    try {
      const res = await staffApi.getByMobile(mobile);

      if (res?.status === "success" && res?.data) {
        setFoundStaff(res.data);
        toast({ title: "Success", description: "Staff found" });
      } else {
        toast({
          title: "Not Found",
          description: "No staff found with this mobile",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Unable to fetch staff",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // ➕ Add staff handler
  const handleAddStaff = async (): Promise<void> => {
    if (!staffForm.name || !staffForm.mob_no) {
      toast({
        title: "Validation Error",
        description: "Name and Mobile are required",
        variant: "destructive",
      });
      return;
    }

    setIsAddingStaff(true);

    try {
      // Call API to add staff
      const res = await fetch(`${import.meta.env.VITE_API_URL || "https://vksum1qvxl.execute-api.us-east-2.amazonaws.com"}/staff`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: staffForm.name,
          mob_no: staffForm.mob_no,
          address: staffForm.address,
          joining_date: staffForm.joining_date,
        }),
      });

      const data = await res.json();

      if (data?.status === "success" || res.ok) {
        toast({
          title: "Success",
          description: "Staff added successfully",
        });

        // Reset form
        setStaffForm({
          name: "",
          mob_no: "",
          address: "",
          joining_date: "",
        });
        setIsDialogOpen(false);
      } else {
        toast({
          title: "Error",
          description: data?.message || "Failed to add staff",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Unable to add staff",
        variant: "destructive",
      });
    } finally {
      setIsAddingStaff(false);
    }
  };

  // 🔎 Filter handler
  const handleFilterStaff = async (): Promise<void> => {
    if (!filterName && !filterMobile && !filterDate) {
      toast({
        title: "Info",
        description: "Please enter at least one filter criteria",
      });
      return;
    }

    setIsFiltering(true);

    try {
      // Call API to get all staff and filter client-side or use backend filters
      const res = await fetch(`${import.meta.env.VITE_API_URL || "https://vksum1qvxl.execute-api.us-east-2.amazonaws.com"}/staff`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (data?.status === "success" && data?.data) {
        // Filter the results client-side
        let filtered = data.data;

        if (filterName) {
          filtered = filtered.filter((staff: StaffType) =>
            staff.name.toLowerCase().includes(filterName.toLowerCase())
          );
        }

        if (filterMobile) {
          filtered = filtered.filter((staff: StaffType) =>
            staff.mob_no.includes(filterMobile)
          );
        }

        if (filterDate) {
          filtered = filtered.filter((staff: StaffType) =>
            staff.joining_date === filterDate
          );
        }

        setFilteredStaffs(filtered);
        toast({
          title: "Success",
          description: `Found ${filtered.length} staff member(s)`,
        });
      } else {
        setFilteredStaffs([]);
        toast({
          title: "Not Found",
          description: "No staff found",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Unable to filter staff",
        variant: "destructive",
      });
    } finally {
      setIsFiltering(false);
    }
  };

  // 🔄 Clear filters handler
  const handleClearFilters = (): void => {
    setFilterName("");
    setFilterMobile("");
    setFilterDate("");
    setFilteredStaffs([]);
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Staff"
        subtitle="Search, add and manage staff"
        actions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-gold">
                <Plus className="w-4 h-4 mr-2" />
                Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Staff</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Staff Name"
                  value={staffForm.name}
                  onChange={(e) =>
                    setStaffForm({ ...staffForm, name: e.target.value })
                  }
                />
                <Input
                  placeholder="Mobile Number"
                  value={staffForm.mob_no}
                  onChange={(e) =>
                    setStaffForm({
                      ...staffForm,
                      mob_no: e.target.value.replace(/\D/g, ""),
                    })
                  }
                />
                <Input
                  placeholder="Address"
                  value={staffForm.address}
                  onChange={(e) =>
                    setStaffForm({ ...staffForm, address: e.target.value })
                  }
                />
                
                {/* Calendar Picker for Joining Date */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${
                        !staffForm.joining_date ? "text-muted-foreground" : ""
                      } border border-input bg-background hover:bg-accent hover:text-accent-foreground`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {staffForm.joining_date ? staffForm.joining_date : "Pick joining date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-black border-yellow-500" align="start">
                    <Calendar
                      mode="single"
                      selected={staffForm.joining_date ? parseLocalDate(staffForm.joining_date) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          setStaffForm({
                            ...staffForm,
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

                <Button
                  className="btn-gold w-full"
                  onClick={handleAddStaff}
                  disabled={isAddingStaff}
                >
                  {isAddingStaff ? "Adding..." : "Save Staff"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* 🔎 Filter Section */}
      <div className="card-premium p-6 mb-8">
        <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
          <Filter className="w-5 h-5" />
          Filter Staff
        </h3>

        <div className="flex gap-3 items-end flex-wrap">
          <Input
            placeholder="Filter by Name"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="w-40"
          />
          <Input
            placeholder="Filter by Mobile"
            value={filterMobile}
            onChange={(e) =>
              setFilterMobile(e.target.value.replace(/\D/g, ""))
            }
            className="w-40"
          />
          
          {/* Calendar Picker for Date Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-40 justify-start text-left font-normal ${
                  !filterDate ? "text-muted-foreground" : ""
                } border border-input bg-background hover:bg-accent hover:text-accent-foreground`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filterDate ? filterDate : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-black border-yellow-500" align="start">
              <Calendar
                mode="single"
                selected={filterDate ? parseLocalDate(filterDate) : undefined}
                onSelect={(date) => {
                  if (date) {
                    setFilterDate(formatDate(date));
                  }
                }}
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                className="border-0"
              />
            </PopoverContent>
          </Popover>

          <Button
            onClick={handleFilterStaff}
            disabled={isFiltering}
            className="btn-gold"
          >
            {isFiltering ? "Filtering..." : "Filter"}
          </Button>
          <Button
            onClick={handleClearFilters}
            variant="outline"
          >
            Clear
          </Button>
        </div>

        {/* Filtered Results */}
        {filteredStaffs.length > 0 && (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Found {filteredStaffs.length} staff member(s)
            </p>
            {filteredStaffs.map((staff) => (
              <div key={staff.id} className="p-4 rounded-lg border bg-muted/30">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <UserCircle className="w-6 h-6 text-primary" />
                  </div>

                  <div className="flex-1">
                    <h4 className="font-semibold">{staff.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {staff.address}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Mobile: {staff.mob_no}
                    </p>
                    <p className="text-xs text-primary">
                      Joined: {staff.joining_date}
                    </p>
                  </div>

                  <div className="flex gap-2 opacity-50">
                    <Button size="icon" variant="outline" disabled>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="destructive" disabled>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 📊 All Staff Table */}
      <div className="card-premium p-6">
        <h3 className="text-lg font-semibold mb-4">All Staff Members</h3>
        
        {isLoadingAllStaffs ? (
          <div className="text-center py-8 text-muted-foreground">Loading staff...</div>
        ) : allStaffs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No staff found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Mobile</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Address</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Joining Date</th>
                  <th className="text-right py-3 px-4 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allStaffs.map((staff) => (
                  <tr key={staff.id} className="border-b border-border/50 hover:bg-muted/30 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <UserCircle className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">{staff.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {staff.mob_no}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{staff.address}</td>
                    <td className="py-3 px-4 text-muted-foreground">{staff.joining_date}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="icon" variant="outline" disabled className="h-8 w-8">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="destructive" disabled className="h-8 w-8">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-sm text-muted-foreground mt-4">Total: {allStaffs.length} staff members</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Staff;
