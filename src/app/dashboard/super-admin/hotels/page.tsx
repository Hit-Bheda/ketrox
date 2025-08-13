"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { z } from "zod";
import { hotelSchema, hotelUpdateSchema } from "@/schemas";
import HotelStats from "@/components/hotels/hotel-stats";
import HotelFiltersAndActions from "@/components/hotels/hotel-filters-and-actions";
import HotelTable from "@/components/hotels/hotel-table";
import HotelDetailsModal from "@/components/hotels/hotel-details-model";
import AddHotelModal from "@/components/hotels/add-hotel-modal";
import UpdateHotelModal from "@/components/hotels/edit-hotel-modal";
import { HotelType } from "@/types"; // Define HotelType in a separate file
import { useSelector } from "react-redux";
import { RootState } from "@/store/store"; // Adjust path to your store
import { useDispatch } from "react-redux";
import { toggleEditModal } from "@/store/slices/hotel-store"; // Adjust path to your hotel slice

// Move these to a constants file or keep here if specific to this page
export const statusColorStyles: { [key: string]: string } = {
  active: "bg-green-500/10 text-green-700 border-green-500/20 dark:text-green-300",
  trial: "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-300",
  suspended: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20 dark:text-yellow-400",
  expired: "bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400",
};

export const planColorStyles: { [key: string]: string } = {
  Pro: "border-purple-500/20 text-purple-700 bg-purple-500/10 dark:text-purple-300",
  Standard: "border-blue-500/20 text-blue-700 bg-blue-500/10 dark:text-blue-300",
  Free: "border-border text-muted-foreground bg-muted/50",
};

export default function HotelsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<HotelType | null>(null);
  const [hotelsData, setHotelsData] = useState<HotelType[]>([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const isEditModelOpen = useSelector((state: RootState) => state.hotel.isEditModelOpen);
  const dispatch = useDispatch();

  const filteredHotels = hotelsData && hotelsData.length > 0
    ? hotelsData.filter((hotel) => {
      const matchesSearch = hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hotel.address.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || hotel.status === statusFilter;
      const matchesPlan = planFilter === "all" || hotel.plan === planFilter;
      return matchesSearch && matchesStatus && matchesPlan;
    })
    : [];

  const getHotelsData = async () => {
    try {
      const res = await fetch("/api/super-admin/hotels");
      if (!res.ok) {
        throw new Error("Failed to fetch hotels");
      }
      const data = await res.json();
      console.log("Fetched hotels data:", data);
      return Array.isArray(data.hotels) ? data.hotels : [];
    } catch (error) {
      console.error("Error fetching hotels:", error);
      return [];
    }
  };

  useEffect(() => {
    getHotelsData().then(data => setHotelsData(data));
  }, []);

  const handleAddHotel = async (formData: z.infer<typeof hotelSchema>) => {
    console.log("Adding hotel:", formData);
    try {
      const res = await fetch("/api/super-admin/hotels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        throw new Error("Failed to add hotel");
      }
      toast.success("Hotel added successfully!");
      setShowAddModal(false);
      getHotelsData().then(data => setHotelsData(data)); // Refresh data
    } catch (error) {
      console.error("Error adding hotel:", error);
      toast.error("Failed to add hotel. Please try again.");
    }
  };

  const handleUpdateHotel = async (formData: z.infer<typeof hotelUpdateSchema>) => {
    console.log("Updating hotel:", formData);
    try {
      const res = await fetch("/api/super-admin/hotels", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        throw new Error("Failed to update hotel");
      }
      toast.success("Hotel updated successfully!");
      dispatch(toggleEditModal(false));
      getHotelsData().then(data => setHotelsData(data)); // Refresh data
    } catch (error) {
      console.error("Error updating hotel:", error);
      toast.error("Failed to update hotel. Please try again.");
    }
  }

  const handleDeleteHotel = async (hotelId: string) => {
    // Add confirmation dialog in practice
    try {
      const res = await fetch("/api/super-admin/hotels", {
        method: "DELETE",
        body: JSON.stringify({ id: hotelId }),
      });
      if (res.ok) {
        toast.success("Hotel deleted successfully");
        await getHotelsData().then(data => setHotelsData(data)); // Refresh data
      } else {
        toast.error("Failed to delete hotel");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("An error occurred while deleting the hotel.");
    }
  }

  const handleViewHotel = (hotel: HotelType) => {
    setSelectedHotel(hotel);
    setShowViewModal(true);
  };

  const stats = {
    total: hotelsData.length,
    active: hotelsData.filter(h => h.status === "active").length,
    trial: hotelsData.filter(h => h.status === "trial").length,
    suspended: hotelsData.filter(h => h.status === "suspended").length,
  };

  const onOpenChange = (open: boolean) => {
    if (!open) dispatch(toggleEditModal(false));
    if (open) setSelectedHotel(null);
  };
  return (
    <div className="bg-background text-foreground min-h-screen p-4 lg:p-6 space-y-6">
      <HotelStats stats={stats} />
      <Card>
        <HotelFiltersAndActions
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          planFilter={planFilter}
          setPlanFilter={setPlanFilter}
          onAddClick={() => setShowAddModal(true)}
        />
        <CardContent>
          <HotelTable
            hotels={filteredHotels}
            onView={handleViewHotel}
            onDelete={handleDeleteHotel}
            statusColorStyles={statusColorStyles}
            planColorStyles={planColorStyles}
          />
        </CardContent>
      </Card>
      <AddHotelModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSubmit={handleAddHotel}
      />
      <HotelDetailsModal
        open={showViewModal}
        onOpenChange={setShowViewModal}
        hotel={selectedHotel}
      />
      <UpdateHotelModal
        open={isEditModelOpen}
        onOpenChange={onOpenChange}
        onSubmit={handleUpdateHotel}
      // Pass the hotel data to edit
      />
    </div>
  );
}