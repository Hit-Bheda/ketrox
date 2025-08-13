"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { hotelSchema } from "@/schemas";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client"; // Ensure this is a configured Supabase client instance
import { toast } from "sonner";

type AddHotelModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: z.infer<typeof hotelSchema>) => void;
};

export default function AddHotelModal({ open, onOpenChange, onSubmit }: AddHotelModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof hotelSchema>>({
    resolver: zodResolver(hotelSchema),
    defaultValues: {
      name: "",
      email: "",
      password:"",
      logoUrl: "", // Optional in schema or make sure to allow empty string
      ownerName: "",
      ownerPhone: "",
      address: "",
      plan: "free",
      status: "active"
    }
  });

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

      const { data, error: signedUrlError } = await supabaseClient.storage.from("mybucket").createSignedUrl(filePath, 1577880000);
      if (signedUrlError || !data) throw signedUrlError || new Error("Failed to create signed URL");
      console.log("File uploaded successfully:", data);
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

  const handleSubmit = async (data: z.infer<typeof hotelSchema>) => {
    let uploadedUrl = data.logoUrl;

    if (file) {
      const url = await handleFileUpload();
      if (!url) {
        toast.error("File upload failed. Please try again.");
        return;
      }
      uploadedUrl = url;
    }

    onSubmit({ ...data, logoUrl: uploadedUrl });
    form.reset();
    setFile(null);
    setUploadError(null);
  };

  // Reset form and file when modal is closed
  useEffect(() => {
    if (!open) {
      form.reset();
      setFile(null);
      setUploadError(null);
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Hotel</DialogTitle>
          <DialogDescription>Create a new hotel registration in the system.</DialogDescription>
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
                  {file && <p className="text-sm text-muted-foreground">{file.name}</p>}
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
                name="password"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="plan"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Plan</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
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
                      <SelectTrigger>
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
                {uploading ? "Uploading..." : "Add Hotel"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}