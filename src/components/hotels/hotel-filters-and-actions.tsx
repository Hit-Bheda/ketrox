import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FiltersAndActionsProps = {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  planFilter: string;
  setPlanFilter: (filter: string) => void;
  onAddClick: () => void; // Handler passed from parent
};

export default function HotelFiltersAndActions({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  planFilter,
  setPlanFilter,
  onAddClick
}: FiltersAndActionsProps) {
  return (
    <CardHeader>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <CardTitle>Hotels Management</CardTitle>
          <CardDescription>Manage all your registered hotels</CardDescription>
        </div>
        <Button onClick={onAddClick}> {/* Use handler passed from parent */}
          <Plus className="w-4 h-4 mr-2" />
          Add Hotel
        </Button>
        {/* Modal can be triggered externally now */}
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search hotels, owners, or addresss..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="trial">Trial</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
        <Select value={planFilter} onValueChange={setPlanFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="standard">Standard</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </CardHeader>
  );
}