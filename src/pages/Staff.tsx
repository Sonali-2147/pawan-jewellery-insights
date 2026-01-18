import { useState } from "react";
import { Plus, Pencil, Trash2, Phone, Mail, UserCircle } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { mockStaff } from "@/data/mockData";
import { Staff as StaffType } from "@/types";
import { useToast } from "@/hooks/use-toast";

const Staff = () => {
  const [staff, setStaff] = useState<StaffType[]>(mockStaff);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffType | null>(null);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", role: "" });
  const { toast } = useToast();

  const handleAdd = () => {
    if (!formData.name || !formData.role) {
      toast({ title: "Error", description: "Name and role are required", variant: "destructive" });
      return;
    }

    const member: StaffType = {
      id: Date.now().toString(),
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      role: formData.role,
      joinedAt: new Date(),
    };

    setStaff([member, ...staff]);
    setFormData({ name: "", phone: "", email: "", role: "" });
    setIsAddOpen(false);
    toast({ title: "Success", description: "Staff member added successfully" });
  };

  const handleUpdate = () => {
    if (!editingStaff || !formData.name || !formData.role) return;

    setStaff(
      staff.map((s) =>
        s.id === editingStaff.id
          ? { ...s, name: formData.name, phone: formData.phone, email: formData.email, role: formData.role }
          : s
      )
    );
    setEditingStaff(null);
    setFormData({ name: "", phone: "", email: "", role: "" });
    toast({ title: "Success", description: "Staff member updated successfully" });
  };

  const handleDelete = (id: string) => {
    setStaff(staff.filter((s) => s.id !== id));
    toast({ title: "Deleted", description: "Staff member removed successfully" });
  };

  const openEditDialog = (member: StaffType) => {
    setEditingStaff(member);
    setFormData({ name: member.name, phone: member.phone, email: member.email, role: member.role });
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
        subtitle="Manage your team members"
        actions={
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="btn-gold">
                <Plus className="w-4 h-4 mr-2" />
                Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="font-display text-xl gold-gradient-text">Add New Staff</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Input
                  placeholder="Full Name *"
                  className="input-premium"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <Input
                  placeholder="Phone Number"
                  className="input-premium"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <Input
                  placeholder="Email"
                  className="input-premium"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <Input
                  placeholder="Role *"
                  className="input-premium"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                />
                <Button onClick={handleAdd} className="w-full btn-gold">
                  Add Staff Member
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Staff Table */}
      <div className="card-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-premium">
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Joined</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => (
                <tr key={member.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <UserCircle className="w-6 h-6 text-primary" />
                      </div>
                      <span className="font-medium text-foreground">{member.name}</span>
                    </div>
                  </td>
                  <td>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        {member.phone}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        {member.email}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${roleColors[member.role] || "bg-muted text-muted-foreground"}`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="text-muted-foreground">{member.joinedAt.toLocaleDateString()}</td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog open={editingStaff?.id === member.id} onOpenChange={(open) => !open && setEditingStaff(null)}>
                        <DialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 hover:bg-muted"
                            onClick={() => openEditDialog(member)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-card border-border">
                          <DialogHeader>
                            <DialogTitle className="font-display text-xl gold-gradient-text">Edit Staff</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            <Input
                              placeholder="Full Name *"
                              className="input-premium"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            <Input
                              placeholder="Phone Number"
                              className="input-premium"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                            <Input
                              placeholder="Email"
                              className="input-premium"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                            <Input
                              placeholder="Role *"
                              className="input-premium"
                              value={formData.role}
                              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            />
                            <Button onClick={handleUpdate} className="w-full btn-gold">
                              Update Staff
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
                            <AlertDialogTitle className="text-foreground">Remove Staff Member?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove "{member.name}" from the system. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-border hover:bg-muted">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(member.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Remove
                            </AlertDialogAction>
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
        {staff.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No staff members found. Add your first team member!
          </div>
        )}
      </div>

      <p className="text-sm text-muted-foreground mt-4">Total: {staff.length} staff members</p>
    </DashboardLayout>
  );
};

export default Staff;
