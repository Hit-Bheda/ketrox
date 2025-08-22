import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface EditTableDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  tableForm: {
    id: string;
    number: string;
    name: string;
    capacity: number;
    notes: string;
  };
  setTableForm: React.Dispatch<React.SetStateAction<{
    id: string;
    number: string;
    name: string;
    capacity: number;
    notes: string;
  }>>;
  capacities: number[];
  onSave: () => void;
  onDelete: () => void;
  loading?: boolean;
}

export default function EditTableDialog({
  open,
  setOpen,
  tableForm,
  setTableForm,
  capacities,
  onSave,
  onDelete,
  loading = false,
}: EditTableDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px] bg-background text-foreground">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Table</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Update or remove this table.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="table-number" className="text-foreground mb-2">Table Number</Label>
              <Input
                id="table-number"
                value={tableForm.number}
                onChange={(e) => setTableForm({ ...tableForm, number: e.target.value })}
                placeholder="T009"
                className="bg-background border-input text-foreground"
              />
            </div>
            <div>
              <Label htmlFor="table-name" className="text-foreground mb-2">Table Name</Label>
              <Input
                id="table-name"
                value={tableForm.name}
                onChange={(e) => setTableForm({ ...tableForm, name: e.target.value })}
                placeholder="Corner Table"
                className="bg-background border-input text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="table-capacity" className="text-foreground mb-2">Capacity</Label>
              <Select
                value={tableForm.capacity.toString()}
                onValueChange={(value) => setTableForm({ ...tableForm, capacity: parseInt(value) })}
              >
                <SelectTrigger className="bg-background border-input text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-popover-foreground">
                  {capacities.map((capacity) => (
                    <SelectItem key={capacity} value={capacity.toString()}>
                      {capacity} guests
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="table-notes" className="text-foreground mb-2">Notes</Label>
            <Textarea
              id="table-notes"
              value={tableForm.notes}
              onChange={(e) => setTableForm({ ...tableForm, notes: e.target.value })}
              placeholder="Special features, accessibility notes..."
              className="bg-background border-input text-foreground"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="destructive"
            onClick={onDelete}
            disabled={loading}
            className="mr-auto"
          >
            {loading ? "Deleting..." : "Remove Table"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-border text-foreground hover:bg-accent"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={onSave}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}