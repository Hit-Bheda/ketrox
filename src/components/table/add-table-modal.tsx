import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddTableDialogProps {
  showAddModal: boolean;
  setShowAddModal: (open: boolean) => void;
  tableForm: {
    number: string;
    name: string;
    capacity: number;
    notes: string;
  };
  setTableForm: React.Dispatch<React.SetStateAction<{
    number: string;
    name: string;
    capacity: number;
    notes: string;
  }>>;
  capacities: number[];
  handleAddTable: () => void;
}

export default function AddTableDialog({
  showAddModal,
  setShowAddModal,
  tableForm,
  setTableForm,
  capacities,
  handleAddTable
}: AddTableDialogProps) {
  return (
    <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
      <DialogContent className="sm:max-w-[500px] bg-background text-foreground">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add New Table</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Add a new table to your restaurant floor plan.
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
            variant="outline"
            onClick={() => setShowAddModal(false)}
            className="border-border text-foreground hover:bg-accent"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddTable}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Add Table
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
