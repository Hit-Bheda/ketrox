"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Shield,
  Clock,
  Phone,
  Mail
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { staffSchema } from "@/schemas";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import UpdateStaffModal from "@/components/staff/edit-staff-modal";
import Image from "next/image";
import { AvatarImage } from "@radix-ui/react-avatar";



const staffData = [
  {
    id: 1,
    name: "Maria Rodriguez",
    email: "maria.rodriguez@restaurant.com",
    phone: "+1 (555) 123-4567",
    role: "Manager",
    status: "active",
    shift: "Morning",
    joinedDate: "2023-01-15",
    lastActive: "2 minutes ago",
    avatar: "MR",
    permissions: {
      dashboard: true,
      staff: true,
      tables: true,
      orders: true,
      invoices: true,
      reports: true,
      settings: false
    }
  },
  {
    id: 2,
    name: "James Thompson",
    email: "james.thompson@restaurant.com",
    phone: "+1 (555) 987-6543",
    role: "Chef",
    status: "active",
    shift: "Evening",
    joinedDate: "2023-02-20",
    lastActive: "5 minutes ago",
    avatar: "JT",
    permissions: {
      dashboard: true,
      staff: false,
      tables: false,
      orders: true,
      invoices: false,
      reports: false,
      settings: false
    }
  },
  {
    id: 3,
    name: "Sarah Kim",
    email: "sarah.kim@restaurant.com",
    phone: "+1 (555) 456-7890",
    role: "Waiter",
    status: "active",
    shift: "Morning",
    joinedDate: "2023-03-10",
    lastActive: "1 hour ago",
    avatar: "SK",
    permissions: {
      dashboard: true,
      staff: false,
      tables: true,
      orders: true,
      invoices: false,
      reports: false,
      settings: false
    }
  },
  {
    id: 4,
    name: "David Chen",
    email: "david.chen@restaurant.com",
    phone: "+1 (555) 321-9876",
    role: "Waiter",
    status: "active",
    shift: "Evening",
    joinedDate: "2023-04-05",
    lastActive: "30 minutes ago",
    avatar: "DC",
    permissions: {
      dashboard: true,
      staff: false,
      tables: true,
      orders: true,
      invoices: false,
      reports: false,
      settings: false
    }
  },
  {
    id: 5,
    name: "Elena Petrov",
    email: "elena.petrov@restaurant.com",
    phone: "+1 (555) 654-3210",
    role: "Chef",
    status: "inactive",
    shift: "Morning",
    joinedDate: "2023-05-12",
    lastActive: "2 days ago",
    avatar: "EP",
    permissions: {
      dashboard: true,
      staff: false,
      tables: false,
      orders: true,
      invoices: false,
      reports: false,
      settings: false
    }
  },
  {
    id: 6,
    name: "Michael Johnson",
    email: "michael.johnson@restaurant.com",
    phone: "+1 (555) 789-0123",
    role: "Waiter",
    status: "active",
    shift: "Night",
    joinedDate: "2023-06-01",
    lastActive: "15 minutes ago",
    avatar: "MJ",
    permissions: {
      dashboard: true,
      staff: false,
      tables: true,
      orders: true,
      invoices: false,
      reports: false,
      settings: false
    }
  }
];

const roles = ["manager", "waiter"];


export default function Staff() {
  async function deleteStaff(id: string) {
    try {
      const res = await fetch("/api/admin/hotel", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Error deleting staff");
      toast.success("Staff deleted successfully!");
      await getStaffList();
    } catch (err: unknown) {
      const errorMessage = typeof err === "object" && err !== null && "message" in err ? (err as { message?: string }).message : "Failed to delete staff";
      toast.error(errorMessage || "Failed to delete staff");
    }
  }
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<typeof staffData[0] | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  async function updateStaff(data: Partial<StaffType> & { id: number }) {
    const res = await fetch("/api/admin/hotel", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || "Error updating staff");
    }
    return result;
  }

  const handleUpdateStaff = async (data: StaffFormData) => {
    if (!selectedStaff) return;
    try {
      const payload = { ...data, id: selectedStaff.id };
      await updateStaff(payload);
      toast.success("Staff updated successfully!");
      setShowUpdateModal(false);
      setSelectedStaff(null);
      await getStaffList();
    } catch (error: unknown) {
      const errorMessage = typeof error === "object" && error !== null && "message" in error ? (error as { message?: string }).message : "Failed to update staff";
      toast.error(errorMessage || "Failed to update staff");
      console.error("Error updating staff:", error);
    }
  };
  type StaffFormData = z.infer<typeof staffSchema> & { status?: "active" | "inactive" };
  const [isSubmitting, setIsSubmitting] = useState(false);
  type StaffType = typeof staffData[0];
  const [staffList, setStaffList] = useState<StaffType[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  const {
    register,
    handleSubmit,
    control,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "waiter",

    },
  });


  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500 text-white border-green-600";
      case "inactive":
        return "bg-red-500 text-white border-red-600";
      default:
        return "bg-gray-300 text-gray-800 border-gray-400";
    }
  };

  const handleEditPermissions = (staff: typeof staffData[0]) => {
    setSelectedStaff(staff);
    setShowPermissionsModal(true);
  };

  const stats = {
    total: staffList.length,
    active: staffList.filter(s => s.status === "active").length,
    inactive: staffList.filter(s => s.status === "inactive").length,
    managers: staffList.filter(s => s.role === "manager").length,
    waiters: staffList.filter(s => s.role === "waiter").length
  };

  async function getStaffList() {
    try {
      const res = await fetch("/api/admin/hotel", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const result = await res.json();
      console.log("staffffff", result);

      if (!res.ok) {
        throw new Error(result.error || "Failed to fetch staff");
      }

      setStaffList(result.staff);
    } catch (error) {
      console.error("Error fetching staff:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getStaffList();
  }, []);

  async function createStaff(staffData: StaffFormData) {
    const res = await fetch("/api/admin/hotel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(staffData),
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.error || "Error creating staff");
    }

    return result;
  }

  const onSubmit = async (data: StaffFormData) => {
    setIsSubmitting(true);
    try {
      const result = await createStaff(data);
      toast.success("Staff added successfully!");
      reset();
      clearErrors();
      setShowAddModal(false);
      await getStaffList();
      console.log("Staff created:", result);
    }
    catch (error: unknown) {
      const errorMessage = typeof error === "object" && error !== null && "message" in error ? (error as { message?: string }).message : "Failed to add staff"; toast.error(errorMessage || "Failed to add staff"); console.error("Error submitting staff form:", error);
    } finally { setIsSubmitting(false); }
  };


  useEffect(() => {
    if (!showAddModal) {
      reset();
      clearErrors();
    }
  }, [showAddModal, reset, clearErrors]);

  async function toggleStaffStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    try {
      const res = await fetch("/api/admin/hotel", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Error updating status");

      toast.success(`Staff ${newStatus === "active" ? "activated" : "deactivated"} successfully`);
      await getStaffList();
    } catch (err: unknown) {
      const errorMessage =
        typeof err === "object" && err !== null && "message" in err
          ? (err as { message?: string }).message
          : "Failed to update staff status";
      toast.error(errorMessage || "Failed to update staff status");
    }
  }


  function getRoleBadgeColor(role: string) {
    switch (role) {
      case "manager":
        return "bg-amber-500 text-white";
      case "waiter":
        return "bg-violet-500 text-white";
      default:
        return "bg-rose-500 text-white";
    }
  }


  return (

    <div className="flex-1 space-y-6 p-6 animate-fadeIn">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserCheck className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-3">{stats.active}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <UserX className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-3">{stats.inactive}</div>
          </CardContent>
        </Card>


        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Managers</CardTitle>
            <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.managers}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waiters</CardTitle>
            <Shield className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-3">{stats.waiters}</div>
          </CardContent>
        </Card>
      </div>

      {/* Staff Management */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Staff Management</CardTitle>
              <CardDescription>Manage your restaurant staff and their permissions</CardDescription>
            </div>
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
              <DialogTrigger asChild>
                <Button className="hover:scale-105 transition-transform">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Staff Member
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Staff Member</DialogTitle>
                  <DialogDescription>
                    Add a new team member to your restaurant staff.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="staff-name" className="mb-2">Full Name</Label>
                        <Input
                          id="staff-name"
                          placeholder="John Doe"
                          {...register("name")}
                        />
                        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                      </div>

                      <div>
                        <Label htmlFor="staff-email" className="mb-2">Email</Label>
                        <Input
                          id="staff-email"
                          type="email"
                          placeholder="john@restaurant.com"
                          {...register("email")}
                        />
                        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="staff-password" className="mb-2">Password</Label>
                      <Input
                        id="staff-password"
                        type="password"
                        placeholder="Enter Password"
                        {...register("password")}
                      />
                      {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="staff-phone" className="mb-2">Phone</Label>
                        <Input
                          id="staff-phone"
                          placeholder="+1 (555) 123-4567"
                          {...register("phone")}
                        />
                        {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
                      </div>

                      <div>
                        <Label htmlFor="staff-role" className="mb-2">Role</Label>
                        <Controller
                          name="role"
                          control={control}
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {roles.map((role) => (
                                  <SelectItem key={role} value={role}>
                                    {role}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button
                        variant="outline"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    </DialogClose>


                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Adding..." : "Add Staff Member"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

          </div>
        </CardHeader>

        <CardContent>
          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Search staff members..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>


          {/* Staff Table */}
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffList
                  .filter((staff) =>
                    roleFilter === "all" || staff.role.toLowerCase() === roleFilter.toLowerCase()
                  )
                  .map((staff) => (
                    <TableRow key={staff.id} className="hover:bg-accent hover:rounded-full transition-colors">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {/* <Avatar className="h-10 w-10">
    <AvatarFallback className="bg-primary text-primary-foreground">
      {staff.avatar}
    </AvatarFallback>
  </Avatar> */}
                          <Avatar className="h-10 w-10 border-1 border-white">
                            <AvatarImage
                              src={"/images/user.png"}
                              alt={staff?.name || "User"}
                            />
                          </Avatar>

                          <div>
                            <p className="font-medium">{staff.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span>{staff.phone}</span>
                      </TableCell>
                      <TableCell>
                        <span>{staff.email}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(staff.role)}>
                          {staff.role}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className={getStatusBadgeColor(staff.status)}>
                          {staff.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="hover:bg-accent">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditPermissions(staff)}>
                              <Shield className="w-4 h-4 mr-2" />
                              Edit Permissions
                            </DropdownMenuItem>
                            {(staff.role.toLowerCase() === "manager" || staff.role.toLowerCase() === "waiter") && (
                              <DropdownMenuItem onClick={() => { setSelectedStaff(staff); setShowUpdateModal(true); }}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Details
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => toggleStaffStatus(staff.id.toString(), staff.status)}
                            >
                              {staff.status === "active" ? (
                                <>
                                  <UserX className="w-4 h-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-4 h-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => deleteStaff(staff.id.toString())}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>

          {staffList.filter(
            staff =>
              (roleFilter === "all" || staff.role.toLowerCase() === roleFilter.toLowerCase()) &&
              (statusFilter === "all" || staff.status.toLowerCase() === statusFilter.toLowerCase()) &&
              (searchTerm === "" || staff.name.toLowerCase().includes(searchTerm.toLowerCase()) || staff.email.toLowerCase().includes(searchTerm.toLowerCase()))
          ).length === 0 && (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-muted mx-auto mb-4" />
                <p className="text-muted-foreground">No staff members found matching your criteria.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm("");
                    setRoleFilter("all");
                    setStatusFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
        </CardContent>
      </Card>

      {/* Permissions Modal */}
      {/* <Dialog open={showPermissionsModal} onOpenChange={setShowPermissionsModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Permissions</DialogTitle>
            <DialogDescription>
              Configure access permissions for {selectedStaff?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedStaff && (
            <div className="space-y-6 py-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-primary-foreground">{selectedStaff.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedStaff.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedStaff.role}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Section Access</h4>
                {Object.entries(selectedStaff.permissions).map(([section, hasAccess]) => (
                  <div key={section} className="flex items-center justify-between">
                    <div>
                      <Label className="capitalize">{section}</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow access to {section} management
                      </p>
                    </div>
                    <Switch checked={hasAccess} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPermissionsModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowPermissionsModal(false)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}

      {/* Update Staff Modal */}
      {selectedStaff && (selectedStaff.role.toLowerCase() === "manager" || selectedStaff.role.toLowerCase() === "waiter") && (
        <UpdateStaffModal
          staff={{
            name: selectedStaff.name,
            email: selectedStaff.email,
            phone: selectedStaff.phone,
            role: selectedStaff.role.toLowerCase() as "manager" | "waiter",
            status: selectedStaff.status === "active" ? "active" : "inactive",
          }}
          showModal={showUpdateModal}
          setShowModal={setShowUpdateModal}
          onSubmit={handleUpdateStaff}
          roles={roles}
        />
      )}
    </div>
  );
}
