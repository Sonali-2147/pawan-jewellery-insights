import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { mockPurposes } from "@/data/mockData";
import { Purpose } from "@/types";
import { useToast } from "@/hooks/use-toast";

const Purposes = () => {
  const [purposes, setPurposes] = useState<Purpose[]>(mockPurposes);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPurpose, setEditingPurpose] = useState<Purpose | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const { toast } = useToast();

  const handleAdd = () => {
    if (!formData.name) {
      toast({ title: "Error", description: "Name is required", variant: "destructive" });
      return;
    }

    const purpose: Purpose = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      createdAt: new Date(),
    };

    setPurposes([purpose, ...purposes]);
    setFormData({ name: "", description: "" });
    setIsAddOpen(false);
    toast({ title: "Success", description: "Purpose added successfully" });
  };

  const handleUpdate = () => {
    if (!editingPurpose || !formData.name) return;

    setPurposes(
      purposes.map((p) =>
        p.id === editingPurpose.id ? { ...p, name: formData.name, description: formData.description } : p
      )
    );
    setEditingPurpose(null);
    setFormData({ name: "", description: "" });
    toast({ title: "Success", description: "Purpose updated successfully" });
  };

  const handleDelete = (id: string) => {
    setPurposes(purposes.filter((p) => p.id !== id));
    toast({ title: "Deleted", description: "Purpose deleted successfully" });
  };

  const openEditDialog = (purpose: Purpose) => {
    setEditingPurpose(purpose);
    setFormData({ name: purpose.name, description: purpose.description });
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Purposes"
        subtitle="Manage jewellery categories and purposes"
        actions={
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="btn-gold">
                <Plus className="w-4 h-4 mr-2" />
                Add Purpose
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="font-display text-xl gold-gradient-text">Add New Purpose</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Input
                  placeholder="Purpose Name *"
                  className="input-premium"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <Textarea
                  placeholder="Description"
                  className="input-premium min-h-[100px]"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                <Button onClick={handleAdd} className="w-full btn-gold">
                  Add Purpose
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Purpose Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {purposes.map((purpose) => (
          <div key={purpose.id} className="card-premium p-6 group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-display font-semibold text-foreground">{purpose.name}</h3>
                <p className="text-muted-foreground text-sm mt-2">{purpose.description}</p>
                <p className="text-xs text-primary mt-4">
                  Added {purpose.createdAt.toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Dialog open={editingPurpose?.id === purpose.id} onOpenChange={(open) => !open && setEditingPurpose(null)}>
                  <DialogTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 hover:bg-muted"
                      onClick={() => openEditDialog(purpose)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-border">
                    <DialogHeader>
                      <DialogTitle className="font-display text-xl gold-gradient-text">Edit Purpose</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <Input
                        placeholder="Purpose Name *"
                        className="input-premium"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                      <Textarea
                        placeholder="Description"
                        className="input-premium min-h-[100px]"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                      <Button onClick={handleUpdate} className="w-full btn-gold">
                        Update Purpose
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
                      <AlertDialogTitle className="text-foreground">Delete Purpose?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete "{purpose.name}". This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-border hover:bg-muted">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(purpose.id)}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        ))}
      </div>

      {purposes.length === 0 && (
        <div className="card-premium p-12 text-center">
          <p className="text-muted-foreground">No purposes found. Add your first purpose!</p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Purposes;
