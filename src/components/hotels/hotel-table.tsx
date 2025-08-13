import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Building } from "lucide-react";
import HotelTableRow from "./hotel-table-row";
import { HotelType } from "@/types"; // Adjust path

type HotelTableProps = {
  hotels: HotelType[];
  onView: (hotel: HotelType) => void;
  onDelete: (hotelId: string) => void;
  statusColorStyles: { [key: string]: string };
  planColorStyles: { [key: string]: string };
};

export default function HotelTable({ hotels, onView, onDelete, statusColorStyles, planColorStyles }: HotelTableProps) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Hotel</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {hotels.length > 0 ? (
            hotels.map((hotel) => (
              <HotelTableRow
                key={hotel.id}
                hotel={hotel}
                onView={onView}
                onDelete={onDelete}
                statusColorStyles={statusColorStyles}
                planColorStyles={planColorStyles}
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground"> {/* Adjust colSpan if needed */}
                <Building className="w-12 h-12 mx-auto mb-4" />
                <p>No hotels found matching your criteria.</p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}