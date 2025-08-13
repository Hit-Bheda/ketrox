import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit } from "lucide-react";
import { HotelType } from "@/types";

const getInitials = (name: string) =>
  typeof name === "string"
    ? name
        .trim()
        .split(/\s+/)
        .map((w) => w[0].toUpperCase())
        .join("")
    : "";

type HotelDetailsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hotel: HotelType | null;
};

export default function HotelDetailsModal({
  open,
  onOpenChange,
  hotel,
}: HotelDetailsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] bg-card/80 backdrop-blur-md text-card-foreground rounded-2xl shadow-2xl border border-border/50 p-0 overflow-hidden">
        
        {/* Header */}
        <DialogHeader className="relative px-6 py-5 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/40">
          {hotel && (
            <DialogTitle className="flex items-center space-x-4">
              <Avatar className="h-14 w-14 ring-2 ring-primary/40 shadow-lg">
                <AvatarImage src={hotel.logo_url} alt={hotel.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                  {getInitials(hotel.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-2xl font-bold leading-tight tracking-tight">
                  {hotel.name}
                </p>
                <p className="text-sm text-muted-foreground">{hotel.address}</p>
              </div>
            </DialogTitle>
          )}
        </DialogHeader>

        {/* Details */}
        {hotel && (
          <div className="px-6 py-6 space-y-4">
            <DetailRow label="Email" value={hotel.email} />
            <DetailRow
              label="Owner"
              value={`${hotel.owner_name} (${hotel.owner_phone})`}
            />
            <DetailRow label="Plan" value={hotel.plan} />
            <DetailRow label="Status" value={hotel.status} />
            <DetailRow
              label="Created"
              value={
                hotel.created_at
                  ? new Date(hotel.created_at).toLocaleDateString()
                  : "N/A"
              }
            />
          </div>
        )}

        {/* Footer */}
        <DialogFooter className="px-6 py-4 bg-muted/40 border-t border-border/40 flex justify-end gap-3">
          <Button
            variant="outline"
            className="border-border text-muted-foreground hover:bg-muted/60"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20">
            <Edit className="w-4 h-4 mr-2" />
            Edit Hotel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center rounded-lg px-4 py-3 bg-muted/40 border border-border/40 hover:bg-muted/60 transition-colors">
      <span className="text-sm font-medium text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}
