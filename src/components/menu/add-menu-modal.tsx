import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { menuSchema } from "@/schemas";
import { LoaderIcon, X } from "lucide-react";
import Image from "next/image";

type MenuItemForm = {
  id: string;
  name: string;
  category: string;
  description: string;
  item_logo?: string[];
  dietary: ("vegetarian" | "vegan" | "glutenFree")[];
  price: string | "";
  preparationTime: string | "";
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  available: boolean;
};

export default function AddMenuModal({
  open,
  setOpen,
  itemForm,
  setItemForm,
  onSave,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  itemForm: MenuItemForm;
  setItemForm: React.Dispatch<React.SetStateAction<MenuItemForm>>;
  menuCategories: { id: string; name: string }[];
  handleAddItem: () => void;
  onSave: () => void;
}) {


  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});


  const handleFileUpload = async (): Promise<string[]> => {
    if (!files.length) return [];
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
    return urls;
  };

  React.useEffect(() => {
    if (open) {
      setFiles([]);
      setPreviewUrls([]);
      setUploadError(null);
    }
  }, [open]);

  const AddMenu = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let tenantId = "";
    if (typeof document !== "undefined") {
      const match = document.cookie.match(/(?:^|; )tenantId=([^;]*)/);
      if (match) tenantId = decodeURIComponent(match[1]);
    }

    const dietaryArr = [];
    if (itemForm.isVegetarian) dietaryArr.push("vegetarian");
    if (itemForm.isVegan) dietaryArr.push("vegan");
    if (itemForm.isGlutenFree) dietaryArr.push("glutenFree");

    const validation = menuSchema.safeParse({
      item_logo: previewUrls,
      item_name: itemForm.name,
      category: itemForm.category,
      description: itemForm.description,
      price: String(itemForm.price),
      prepTime: String(itemForm.preparationTime),
      dietary: dietaryArr,
      tenantId,
      isAvailable: itemForm.available,
    });

    if (!validation.success) {
      const fieldErrors: { [key: string]: string } = {};
      validation.error.issues.forEach(err => {
        if (err.path[0]) fieldErrors[String(err.path[0])] = err.message;
      });
      setErrors(fieldErrors);
      setUploading(false);
      return;
    } else {
      setErrors({});
    }
    setUploading(true);
    try {
      let imageUrls: string[] = [];
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
      const { name, category, description, isVegetarian, isVegan, isGlutenFree, available } = itemForm;
      const dietaryArr = [];
      if (isVegetarian) dietaryArr.push("vegetarian");
      if (isVegan) dietaryArr.push("vegan");
      if (isGlutenFree) dietaryArr.push("glutenFree");
      const response = await fetch("/api/admin/menu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          item_logo: imageUrls,
          item_name: name,
          category,
          description,
          price: itemForm.price, // <-- keep as string
          prepTime: itemForm.preparationTime,
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
      console.log("Menu item added successfully:", data);
      toast.success(data.message);
      setOpen(false);
      onSave();
      setItemForm({
        id: "",
        name: "",
        category: "",
        description: "",
        item_logo: [],
        price: "",
        preparationTime: "",
        dietary: [],
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        available: true
      });
      setFiles([]);
      setPreviewUrls([]);
      setUploadError(null);
    } catch (error) {
      console.error("Error adding menu item:", error);
      toast.error("Failed to add menu item. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setItemForm({
      id: "",
      name: "",
      category: "",
      description: "",
      item_logo: [],
      price: "",
      preparationTime: "",
      dietary: [],
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      available: true
    });
    setFiles([]);
    setPreviewUrls([]);
    setUploadError(null);
    setErrors({});
  };
  return (

    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto scrollbar-hide">
        <form onSubmit={AddMenu}>
          <DialogHeader>
            <DialogTitle>Add New Menu Item</DialogTitle>
            <DialogDescription>
              Create a new menu item with all details and specifications.
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
                    if (errors.item_logo) {
                      setErrors((prev) => ({ ...prev, item_logo: "" }));
                    }
                  }}
                  className="hidden"
                />
                {errors.item_logo && <p className="text-red-500 text-sm">{errors.item_logo}</p>}

                <label htmlFor="item-image" className="cursor-pointer">
                  <p className="text-muted-foreground">Click to upload or drag & drop</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, WEBP (max 5MB each)</p>
                </label>
              </div>

              {uploadError && (
                <div className="text-destructive text-xs mt-2">{uploadError}</div>
              )}

              {previewUrls.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {previewUrls.map((url, idx) => (
                    <div key={idx} className="relative h-20 w-20">
                      <Image
                        src={url}
                        fill
                        sizes="(max-width: 768px) 100vw, 423px"
                        priority
                         fetchPriority="high" 
                        alt={`Preview ${idx + 1}`}
                        className="object-cover rounded-md h-full w-full"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-white opacity-80 hover:opacity-100 transition"
                        onClick={() => {
                          setPreviewUrls(prev => prev.filter((_, i) => i !== idx));
                          setFiles(prev => prev.filter((_, i) => i !== idx));
                          // Optionally clear error if all images removed
                          if (previewUrls.length === 1 && errors.item_logo) {
                            setErrors(prev => ({ ...prev, item_logo: "" }));
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
                  onChange={(e) => {
                    setItemForm({ ...itemForm, name: e.target.value });
                    if (errors.item_name) setErrors(prev => ({ ...prev, item_name: "" }));
                  }}
                  placeholder="Truffle Pasta"
                />
                {errors.item_name && <p className="text-red-500 text-sm">{errors.item_name}</p>}
              </div>
              <div>
                <Label htmlFor="item-category" className="mb-2">Category</Label>
                <Input
                  id="item-category"
                  value={itemForm.category}
                  onChange={(e) => {
                    setItemForm({ ...itemForm, category: e.target.value });
                    if (errors.category) setErrors(prev => ({ ...prev, category: "" }));
                  }}
                  placeholder="e.g. Appetizers"
                />
                {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="item-description" className="mb-2">Description</Label>
              <Textarea
                id="item-description"
                value={itemForm.description}
                onChange={(e) => {
                  setItemForm({ ...itemForm, description: e.target.value });
                  if (errors.description) setErrors(prev => ({ ...prev, description: "" }));
                }}
                placeholder="Detailed description of the dish..."
              />
              {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="item-price" className="mb-2">Price ($)</Label>
                <Input
                  id="item-price"
                  type="number"
                  step="0.01"
                  value={itemForm.price ?? ""}
                  onChange={(e) => {
                    setItemForm({
                      ...itemForm,
                      price: e.target.value, // keep as string
                    });
                    if (errors.price) setErrors(prev => ({ ...prev, price: "" }));
                  }}
                  placeholder="24.99"
                />
                {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
              </div>

              <div>
                <Label htmlFor="prep-time" className="mb-2">Prep Time (minutes)</Label>
                <Input
                  id="prep-time"
                  type="number"
                  value={itemForm.preparationTime ?? 0}
                  onChange={(e) => {
                    setItemForm({
                      ...itemForm,
                      preparationTime: e.target.value, // keep as string
                    });
                    if (errors.prepTime) setErrors(prev => ({ ...prev, prepTime: "" }));
                  }}
                  placeholder="15"
                />
                {errors.prepTime && <p className="text-red-500 text-sm">{errors.prepTime}</p>}
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
            <Button variant="outline" type="button" onClick={() => {
              setOpen(false);
              resetForm();

            }}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploading} className="flex items-center gap-2">
              {uploading && <LoaderIcon className="w-4 h-4 animate-spin text-white" />}
              {uploading ? "Adding..." : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

  );
}
