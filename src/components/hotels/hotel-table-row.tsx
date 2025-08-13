"use "

import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Trash2, MapPin, Calendar } from "lucide-react";
import { HotelType } from "@/types"; // Adjust path
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { setSelectedHotel, toggleEditModal } from "@/store/slices/hotel-store";

// Move to utils or keep here if specific
function formatISODate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Move to utils or keep here if specific
const getInitials = (name: string) =>
  typeof name === "string"
    ? name.trim().split(/\s+/).map(w => w[0].toUpperCase()).join("")
    : "";

type HotelTableRowProps = {
  hotel: HotelType;
  onView: (hotel: HotelType) => void;
  onDelete: (hotelId: string) => void;
  statusColorStyles: { [key: string]: string };
  planColorStyles: { [key: string]: string };
};

export default function HotelTableRow({ hotel, onView, onDelete, statusColorStyles, planColorStyles }: HotelTableRowProps) {
  const dispatch = useDispatch<AppDispatch>();
  return (
    <TableRow key={hotel.id}>
      <TableCell>
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={hotel.logo_url} alt={hotel.name} />
            <AvatarFallback>{getInitials(hotel.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{hotel.name}</p>
            <p className="text-sm text-muted-foreground">{hotel.email}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div>
          <p className="font-medium">{hotel.owner_name}</p>
          <p className="text-sm text-muted-foreground">{hotel.owner_phone}</p>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={planColorStyles[hotel.plan]}>
          {hotel.plan}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-1">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{hotel.address}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className={statusColorStyles[hotel.status]}
        >
          {hotel.status.charAt(0).toUpperCase() + hotel.status.slice(1)}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-1">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{formatISODate(hotel.created_at)}</span>
        </div>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(hotel)}>
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              dispatch(toggleEditModal(true));
              dispatch(setSelectedHotel(hotel))
            }}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(hotel.id)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}