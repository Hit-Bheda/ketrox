"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { hotelUpdateSchema } from "@/schemas";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store"; // Adjust path to your store
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store"; // Adjust path to your store
import { setSelectedHotel } from "@/store/slices/hotel-store"; // Adjust path to your hotel slice
import Image from "next/image";

type UpdateHotelModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: z.infer<typeof hotelUpdateSchema>) => void;
};

export default function UpdateHotelModal({ open, onOpenChange, onSubmit }: UpdateHotelModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(null);
    const initialData = useSelector((state: RootState) => state.hotel.selectedHotel);
    const dispatch = useDispatch<AppDispatch>();

    const form = useForm<z.infer<typeof hotelUpdateSchema>>({
        resolver: zodResolver(hotelUpdateSchema),
        defaultValues: {
            id: initialData?.id || "",
            name: "",
            email: "",
            logoUrl: "",
            ownerName: "",
            ownerPhone: "",
            address: "",
            plan: "free",
            status: "active"
        }
    });

    // Set initial data when modal opens
    useEffect(() => {
        if (open && initialData) {
            form.reset({
                id: initialData.id,
                name: initialData.name || "",
                email: initialData.email || "",
                logoUrl: initialData.logo_url || "",
                ownerName: initialData.owner_name || "",
                ownerPhone: initialData.owner_phone || "",
                address: initialData.address || "",
                plan: (initialData.plan === "free" || initialData.plan === "standard" ? initialData.plan : "free") as "free" | "standard",
                status: (initialData.status === "active" || initialData.status === "trial" || initialData.status === "suspended" || initialData.status === "expired" ? initialData.status : "active") as "active" | "trial" | "suspended" | "expired"
            });
            setExistingLogoUrl(initialData.logo_url || null);
            setFile(null);
            setUploadError(null);
        }
    }, [open, initialData, form]);

    const handleFileUpload = async (): Promise<string | null> => {
        if (!file) return null;

        try {
            setUploading(true);
            setUploadError(null);

            const fileExt = file.name.split(".").pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `uploads/${fileName}`;

            const supabaseClient = supabase();
            const { error } = await supabaseClient.storage
                .from("mybucket")
                .upload(filePath, file, { contentType: file.type });

            if (error) throw error;

            const { data, error: signedUrlError } = await supabaseClient.storage
                .from("mybucket")
                .createSignedUrl(filePath, 1577880000);

            if (signedUrlError || !data) throw signedUrlError || new Error("Failed to create signed URL");
            return data.signedUrl;
        } catch (err) {
            console.error("Upload error:", err);
            setUploadError(
                typeof err === "object" && err !== null && "message" in err
                    ? String((err as { message?: string }).message)
                    : "Upload failed"
            );
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (data: z.infer<typeof hotelUpdateSchema>) => {
        let uploadedUrl = data.logoUrl;

        // If a new file is selected, upload it
        if (file) {
            const url = await handleFileUpload();
            // const data = await fetch
            if (!url) {
                toast.error("File upload failed. Please try again.");
                return;
            }
            uploadedUrl = url;
        } else {
            // If no new file, keep existing logo URL
            uploadedUrl = existingLogoUrl || "";
        }

        onSubmit({ ...data, logoUrl: uploadedUrl });
        dispatch(setSelectedHotel(null)); // Clear selected hotel in Redux store
        onOpenChange(false); // Close the modal
        form.reset();
        setFile(null);
        setUploadError(null);
        setExistingLogoUrl(null);
    };

    // Reset form and file when modal is closed
    useEffect(() => {
        if (!open) {
            form.reset();
            setFile(null);
            setUploadError(null);
            setExistingLogoUrl(null);
        }
    }, [open, form]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Update Hotel</DialogTitle>
                    <DialogDescription>Update hotel information in the system.</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="logoUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Logo</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const selectedFile = e.target.files?.[0] || null;
                                                setFile(selectedFile);
                                                // Set a temporary value to pass validation
                                                field.onChange(selectedFile ? "temp_file_selected" : "");
                                            }}
                                        />
                                    </FormControl>
                                    {existingLogoUrl && !file && (
                                        <div className="mt-2">
                                            <p className="text-sm text-muted-foreground">Current logo:</p>
                                            <div className="relative mt-1 h-16 w-16">
                                                <Image
                                                    src={existingLogoUrl}
                                                    alt="Current logo"
                                                    fill
                                                    className="object-cover rounded"
                                                    sizes="64px"
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {file && <p className="text-sm text-muted-foreground mt-1">New file: {file.name}</p>}
                                    {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Hotel Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter hotel name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter hotel email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter hotel address" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex gap-4">
                            <FormField
                                control={form.control}
                                name="ownerName"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Owner Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter owner name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="ownerPhone"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Owner Phone</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter owner phone" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex w-full gap-4">
                            <FormField
                                control={form.control}
                                name="plan"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Plan</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select plan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="free">Free</SelectItem>
                                                <SelectItem value="standard">Standard</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="trial">Trial</SelectItem>
                                                <SelectItem value="suspended">Suspended</SelectItem>
                                                <SelectItem value="expired">Expired</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={uploading}>
                                {uploading ? "Updating..." : "Update Hotel"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}