import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";

interface StaffFormData {
  name: string;
  email: string;
  phone: string;
  role: "manager" | "waiter";
  password?: string;
  status?: "active" | "inactive";
}

interface UpdateStaffModalProps {
  staff: StaffFormData;
  showModal: boolean;
  setShowModal: (value: boolean) => void;
  onSubmit: (data: StaffFormData) => void;
  roles: string[];
}

export default function UpdateStaffModal({
  staff,
  showModal,
  setShowModal,
  onSubmit,
  roles
}: UpdateStaffModalProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<StaffFormData>({
    defaultValues: {
      ...staff,
      password: ""
    }
  });


  useEffect(() => {
    if (staff) {
      reset(staff);
    }
  }, [staff, reset]);

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Staff Member</DialogTitle>
          <DialogDescription>
            Modify the details for this staff member.
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
                  {...register("name", { required: "Name is required" })}
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
              </div>

              <div>
                <Label htmlFor="staff-email" className="mb-2">Email</Label>
                <Input
                  id="staff-email"
                  type="email"
                  placeholder="john@restaurant.com"
                  {...register("email", { required: "Email is required" })}
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="staff-phone" className="mb-2">Phone</Label>
                <Input
                  id="staff-phone"
                  placeholder="+1 (555) 123-4567"
                  {...register("phone", { required: "Phone number is required" })}
                />
                {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
              </div>

              <div>
                <Label htmlFor="staff-role" className="mb-2">Role</Label>
                <Controller
                  name="role"
                  control={control}
                  rules={{ required: "Role is required" }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
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
              <Button variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Staff Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
