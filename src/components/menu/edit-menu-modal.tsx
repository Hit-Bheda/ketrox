import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import Image from "next/image";
import { LoaderIcon, X } from "lucide-react";
import { MenuItem } from "@/types";


export default function EditMenuModal({
  open,
  setOpen,
  itemForm,
  setItemForm,
  onSave
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  itemForm: MenuItem;
  setItemForm: React.Dispatch<React.SetStateAction<MenuItem>>;
  menuCategories: { id: string; name: string }[];
  onSave: () => void;
}) {

  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    setUploadError(null);
    setFiles([]);
    setPreviewUrls(itemForm.image || []);
  }, [open, itemForm.image]);

  const handleFileUpload = async (): Promise<string[]> => {
    if (!files.length) return previewUrls; // keep existing if no new files
    const urls: string[] = [];
    for (const file of files) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;
      const supabaseClient = supabase();
      const { error } = await supabaseClient.storage
        .from("mybucket")
        .upload(filePath, file, { contentType: file.type });
      if (error) continue;
      const { data, error: signedUrlError } = await supabaseClient.storage.from("mybucket").createSignedUrl(filePath, 1577880000);
      if (!signedUrlError && data) urls.push(data.signedUrl);
    }
    // Merge new uploads with existing (if you want to keep old images)
    return [...previewUrls.filter(url => url.startsWith("http")), ...urls];
  };

  const handleEditMenu = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!previewUrls.length) {
      setImageError("At least one image is required!");
      return;
    } else {
      setImageError(null);
    }

    setUploading(true);
    try {
      let imageUrls: string[] = previewUrls;
      if (files.length) {
        imageUrls = await handleFileUpload();
        if (!imageUrls.length) {
          toast.error("Image upload failed");
          setUploading(false);
          return;
        }
      }
      let tenantId = "";
      if (typeof document !== "undefined") {
        const match = document.cookie.match(/(?:^|; )tenantId=([^;]*)/);
        if (match) tenantId = decodeURIComponent(match[1]);
      }
      const { id, name, category, description, isVegetarian, isVegan, isGlutenFree, available } = itemForm;
      const dietaryArr = [];
      if (isVegetarian) dietaryArr.push("vegetarian");
      if (isVegan) dietaryArr.push("vegan");
      if (isGlutenFree) dietaryArr.push("glutenFree");
      const response = await fetch("/api/admin/menu", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          item_logo: imageUrls, // <-- send array of image URLs
          item_name: name,
          category,
          description,
          price: String(itemForm.price), // <-- keep as string
          prepTime: String(itemForm.preparationTime),
          tenantId,
          dietary: dietaryArr,
          isAvailable: available
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || errorData.message);
        setUploading(false);
        return;
      }
      const data = await response.json();
      toast.success(data.message);
      setOpen(false);
      onSave();
      setFiles([]);
      setPreviewUrls([]);
      setUploadError(null);
    } catch (error) {
      console.error("Error updating menu item:", error);
      toast.error("Failed to update menu item. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <form onSubmit={handleEditMenu}>
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
            <DialogDescription>
              Update the details for this menu item.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            
            <div className="mb-2">
              <label htmlFor="item-image" className="mb-2 block text-sm font-medium">
                Item Image
              </label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-accent/10 transition">
                <input
                  id="item-image"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const selectedFiles = Array.from(e.target.files ?? []);
                    if (selectedFiles.length === 0) return;
                    setFiles((prev) => [...prev, ...selectedFiles]);
                    previewUrls.forEach((url) => URL.revokeObjectURL(url));
                    setPreviewUrls((prev) => [
                      ...prev,
                      ...selectedFiles.map((file) => URL.createObjectURL(file)),
                    ]);
                    setUploadError(null);
                  }}
                  className="hidden"
                />
                <label htmlFor="item-image" className="cursor-pointer">
                  <p className="text-muted-foreground">Click to upload or drag & drop</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, WEBP (max 5MB each)</p>
                </label>
              </div>
              {uploadError && (
                <div className="text-destructive text-xs mt-2">{uploadError}</div>
              )}
              {imageError && (
                <div className="text-destructive text-xs mt-2">{imageError}</div>
              )}
              {previewUrls.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {previewUrls.map((url, idx) => (
                    <div key={idx} className="relative h-20 w-20 group">
                      <Image
                        src={url}
                        alt={`Preview ${idx + 1}`}
                        className="object-cover rounded-md h-full w-full"
                        width={80}
                        height={80}
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-white opacity-80 hover:opacity-100 transition"
                        onClick={() => {
                    
                          setPreviewUrls((prev) => prev.filter((_, i) => i !== idx));
                          if (url.startsWith("blob:")) {
                            setFiles((prev) => prev.filter((_, i) => {
                              return URL.createObjectURL(prev[i]) !== url;
                            }));
                          }
                        }}
                        aria-label="Remove image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="item-name" className="mb-2">Item Name</Label>
                <Input
                  id="item-name"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  placeholder="Truffle Pasta"
                />
              </div>
              <div>
                <Label htmlFor="item-category" className="mb-2">Category</Label>
                <Input
                  id="item-category"
                  value={itemForm.category}
                  onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                  placeholder="e.g. Appetizers"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="item-description" className="mb-2">Description</Label>
              <Textarea
                id="item-description"
                value={itemForm.description}
                onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                placeholder="Detailed description of the dish..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="item-price" className="mb-2">Price ($)</Label>
                <Input
                  id="item-price"
                  type="number"
                  step="0.01"
                  value={itemForm.price ?? ""}
                  onChange={(e) =>
                    setItemForm({
                      ...itemForm,
                      price: e.target.value
                    })
                  }
                  placeholder="24.99"
                />
              </div>
              <div>
                <Label htmlFor="prep-time" className="mb-2">Prep Time (minutes)</Label>
                <Input
                  id="prep-time"
                  type="number"
                  value={itemForm.preparationTime ?? 0}
                  onChange={(e) =>
                    setItemForm({
                      ...itemForm,
                      preparationTime: e.target.value,
                    })
                  }
                  placeholder="15"
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label>Dietary Options</Label>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="vegetarian"
                    checked={itemForm.isVegetarian}
                    onCheckedChange={(checked) => setItemForm({ ...itemForm, isVegetarian: checked })}
                  />
                  <Label htmlFor="vegetarian">Vegetarian</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="vegan"
                    checked={itemForm.isVegan}
                    onCheckedChange={(checked) => setItemForm({ ...itemForm, isVegan: checked })}
                  />
                  <Label htmlFor="vegan">Vegan</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="gluten-free"
                    checked={itemForm.isGlutenFree}
                    onCheckedChange={(checked) => setItemForm({ ...itemForm, isGlutenFree: checked })}
                  />
                  <Label htmlFor="gluten-free">Gluten Free</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="available"
                    checked={itemForm.available}
                    onCheckedChange={(checked) => setItemForm({ ...itemForm, available: checked })}
                  />
                  <Label htmlFor="available">Available</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading && <LoaderIcon className="w-4 h-4 animate-spin text-white" />}
              {uploading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
