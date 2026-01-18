import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Purpose, PurposeFormData } from "@/types";
import { purposeApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const Purposes = () => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPurpose, setEditingPurpose] = useState<Purpose | null>(null);
  const [formData, setFormData] = useState<PurposeFormData>({ purpose: "", descr: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch purposes
  const { data: purposesData, isLoading, error } = useQuery({
    queryKey: ["purposes"],
    queryFn: () => purposeApi.getAll(),
    retry: 1,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: purposeApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purposes"] });
      setIsAddOpen(false);
      setFormData({ purpose: "", descr: "" });
      toast({ title: "Success", description: "Purpose added successfully" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: PurposeFormData }) => purposeApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purposes"] });
      setEditingPurpose(null);
      setFormData({ purpose: "", descr: "" });
      toast({ title: "Success", description: "Purpose updated successfully" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: purposeApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purposes"] });
      toast({ title: "Deleted", description: "Purpose deleted successfully" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const purposes = purposesData?.data || [];

  const handleAdd = () => {
    if (!formData.purpose) {
      toast({ title: "Error", description: "Name is required", variant: "destructive" });
      return;
    }
    createMutation.mutate(formData);
  };

  const handleUpdate = () => {
    if (!editingPurpose || !formData.purpose) return;
    updateMutation.mutate({ id: editingPurpose.id, data: formData });
  };

  const openEditDialog = (purpose: Purpose) => {
    setEditingPurpose(purpose);
    setFormData({ purpose: purpose.purpose, descr: purpose.descr });
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
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                />
                <Textarea
                  placeholder="Description"
                  className="input-premium min-h-[100px]"
                  value={formData.descr}
                  onChange={(e) => setFormData({ ...formData, descr: e.target.value })}
                />
                <Button onClick={handleAdd} className="w-full btn-gold" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Adding..." : "Add Purpose"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {isLoading && <div className="text-center py-12 text-muted-foreground">Loading purposes...</div>}
      {error && <div className="text-center py-12 text-destructive">Error loading purposes. Check API connection.</div>}

      {/* Purpose Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {purposes.map((purpose) => (
          <div key={purpose.id} className="card-premium p-6 group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-display font-semibold text-foreground">{purpose.purpose}</h3>
                <p className="text-muted-foreground text-sm mt-2">{purpose.descr}</p>
                <p className="text-xs text-primary mt-4">ID: {purpose.id}</p>
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
                        value={formData.purpose}
                        onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                      />
                      <Textarea
                        placeholder="Description"
                        className="input-premium min-h-[100px]"
                        value={formData.descr}
                        onChange={(e) => setFormData({ ...formData, descr: e.target.value })}
                      />
                      <Button onClick={handleUpdate} className="w-full btn-gold" disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? "Updating..." : "Update Purpose"}
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
                        This will permanently delete "{purpose.purpose}". This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-border hover:bg-muted">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteMutation.mutate(purpose.id)}
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

      {purposes.length === 0 && !isLoading && (
        <div className="card-premium p-12 text-center">
          <p className="text-muted-foreground">No purposes found. Add your first purpose!</p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Purposes;
