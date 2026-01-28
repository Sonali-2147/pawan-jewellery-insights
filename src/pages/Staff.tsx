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
  }, [toast]);

  // Helper function to refresh staff list
  const refreshStaffList = async (): Promise<void> => {
    try {
      const res = await staffApi.getAll();
      if (res?.status === "success" && res?.data) {
        setAllStaffs(res.data);
      }
    } catch (err) {
      console.error("Error refreshing staff:", err);
    }
  };

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
        
        // Refresh staff list to show new staff
        await refreshStaffList();
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
      // Filter the current allStaffs list
      let filtered = [...allStaffs];

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
              <Button className="btn-gold text-sm">
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Add Staff</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md mx-4">
              <DialogHeader>
                <DialogTitle>Add New Staff</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Staff Name"
                  className="text-sm"
                  value={staffForm.name}
                  onChange={(e) =>
                    setStaffForm({ ...staffForm, name: e.target.value })
                  }
                />
                <Input
                  placeholder="Mobile Number"
                  className="text-sm"
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
                  className="text-sm"
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
                      className={`w-full justify-start text-left font-normal text-sm ${
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
                  className="btn-gold w-full text-sm"
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
      <div className="card-premium p-4 lg:p-6 mb-8">
        <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
          <Filter className="w-5 h-5" />
          Filter Staff
        </h3>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
          <Input
            placeholder="Filter by Name"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="w-full sm:w-40 text-sm"
          />
          <Input
            placeholder="Filter by Mobile"
            value={filterMobile}
            onChange={(e) =>
              setFilterMobile(e.target.value.replace(/\D/g, ""))
            }
            className="w-full sm:w-40 text-sm"
          />
          
          {/* Calendar Picker for Date Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-full sm:w-40 justify-start text-left font-normal text-sm ${
                  !filterDate ? "text-muted-foreground" : ""
                } border border-input bg-background hover:bg-accent hover:text-accent-foreground`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span className="truncate">{filterDate ? filterDate : "Pick a date"}</span>
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

          <div className="flex gap-2">
            <Button
              onClick={handleFilterStaff}
              disabled={isFiltering}
              className="btn-gold text-sm flex-1 sm:flex-none"
            >
              {isFiltering ? "Filtering..." : "Filter"}
            </Button>
            <Button
              onClick={handleClearFilters}
              variant="outline"
              className="text-sm flex-1 sm:flex-none"
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Filtered Results */}
        {filteredStaffs.length > 0 && (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Found {filteredStaffs.length} staff member(s)
            </p>
            {filteredStaffs.map((staff) => (
              <div key={staff.id} className="p-4 rounded-lg border bg-muted/30">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <UserCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm sm:text-base truncate">{staff.name}</h4>
                    <p className="text-sm text-muted-foreground truncate">
                      {staff.address}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Mobile: {staff.mob_no}
                    </p>
                    <p className="text-xs text-primary">
                      Joined: {staff.joining_date}
                    </p>
                  </div>

                  <div className="flex gap-1 sm:gap-2 opacity-50 flex-shrink-0">
                    <Button size="icon" variant="outline" disabled className="h-8 w-8">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="destructive" disabled className="h-8 w-8">
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
      <div className="card-premium p-4 lg:p-6">
        <h3 className="text-lg font-semibold mb-4">All Staff Members</h3>
        
        {isLoadingAllStaffs ? (
          <div className="text-center py-8 text-muted-foreground">Loading staff...</div>
        ) : allStaffs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No staff found</div>
        ) : (
          <div className="overflow-x-auto -mx-4 lg:mx-0">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="w-full min-w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground text-xs lg:text-sm">ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground text-xs lg:text-sm">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground text-xs lg:text-sm hidden sm:table-cell">Mobile</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground text-xs lg:text-sm hidden lg:table-cell">Address</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground text-xs lg:text-sm hidden md:table-cell">Joining Date</th>
                      <th className="text-right py-3 px-4 font-semibold text-foreground text-xs lg:text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allStaffs.map((staff) => (
                      <tr key={staff.id} className="border-b border-border/50 hover:bg-muted/30 transition">
                        <td className="py-3 px-4 text-muted-foreground font-mono text-xs lg:text-sm">{staff.id}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <UserCircle className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium text-foreground text-sm truncate max-w-[100px] lg:max-w-none">{staff.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-sm hidden sm:table-cell">
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            <span className="truncate max-w-[100px]">{staff.mob_no}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-sm hidden lg:table-cell">
                          <div className="truncate max-w-[150px]">{staff.address}</div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-sm hidden md:table-cell">{staff.joining_date}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-1 lg:gap-2">
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
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4 px-4 lg:px-0">Total: {allStaffs.length} staff members</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Staff;
