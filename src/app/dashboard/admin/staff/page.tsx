"use client";

import { useState } from "react";
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

// Realistic staff data
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
// const shifts = ["Morning", "Evening", "Night"];

export default function Staff() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<typeof staffData[0] | null>(null);
  type StaffFormData = z.infer<typeof staffSchema>;

  const {
    register,
    handleSubmit,
    control,
    reset,
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

  // Form state for add staff modal
  const [staffForm, setStaffForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "waiter",
  });

  const filteredStaff = staffData.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || staff.role === roleFilter;
    const matchesStatus = statusFilter === "all" || staff.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Manager":
        return "bg-primary text-primary-foreground";
      case "Waiter":
        return "bg-chart-3 text-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-chart-3 text-foreground";
      case "inactive":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleAddStaff = () => {
    console.log("Adding staff:", staffForm);
    setShowAddModal(false);
    setStaffForm({
      name: "",
      email: "",
      phone: "",
      role: "Waiter",
    });
  };

  const handleEditPermissions = (staff: typeof staffData[0]) => {
    setSelectedStaff(staff);
    setShowPermissionsModal(true);
  };

  const stats = {
    total: staffData.length,
    active: staffData.filter(s => s.status === "active").length,
    managers: staffData.filter(s => s.role === "Manager").length,
    waiters: staffData.filter(s => s.role === "Waiter").length
  };

  const onSubmit = async (data: StaffFormData) => {
    try {
      const res = await fetch("/api/admin/hotel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        console.error(result.error || "Error creating staff");
        return;
      }

      // success
      console.log("Staff created:", result);
      reset();
      setShowAddModal(false);
    } catch (error) {
      console.error("Error submitting staff form:", error);
    }
  };

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
            <CardTitle className="text-sm font-medium">Managers</CardTitle>
            <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.managers}</div>
          </CardContent>
        </Card>

        {/* <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chefs</CardTitle>
              <Shield className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{stats.chefs}</div>
            </CardContent>
          </Card> */}

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
                    <Button variant="outline" onClick={() => setShowAddModal(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Staff Member</Button>
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
                  <TableHead>Role</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((staff) => (
                  <TableRow key={staff.id} className="hover:bg-accent transition-colors">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary text-primary-foreground">{staff.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{staff.name}</p>
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            <span>{staff.email}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            <span>{staff.phone}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(staff.role)}>
                        {staff.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{staff.shift}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadgeColor(staff.status)}>
                        {staff.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{staff.lastActive}</span>
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
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
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
                          <DropdownMenuItem className="text-destructive">
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

          {filteredStaff.length === 0 && (
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
      <Dialog open={showPermissionsModal} onOpenChange={setShowPermissionsModal}>
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
      </Dialog>
    </div>
  );
}
