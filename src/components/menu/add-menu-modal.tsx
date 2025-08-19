import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

type MenuItemForm = {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl?: string;
  dietary: ("vegetarian" | "vegan" | "glutenFree")[];
  price: number;
  preparationTime: number;
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
  menuCategories,
  handleAddItem,
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

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);


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

  const AddMenu = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setUploading(true);
    try {
      let imageUrl = itemForm.imageUrl;
      if (file && (!imageUrl || imageUrl.startsWith("blob:"))) {
        const uploadedUrl = await handleFileUpload();
        if (!uploadedUrl) {
          toast.error("Image upload failed");
          setUploading(false);
          return;
        }
        imageUrl = uploadedUrl;
      }
      let tenantId = "";
      if (typeof document !== "undefined") {
        const match = document.cookie.match(/(?:^|; )tenantId=([^;]*)/);
        if (match) tenantId = decodeURIComponent(match[1]);
      }
      const { name, category, description, price, preparationTime, isVegetarian, isVegan, isGlutenFree, available } = itemForm;
      // Send dietary as array of strings
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
          item_logo: imageUrl,
          itemName: name,
          category,
          description,
          price,
          tenantId,
          prepTime: preparationTime,
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
      console.log("Menu item added:", data);
      toast.success(data.message);
      setOpen(false);
      onSave();
      setItemForm({
        id: "",
        name: "",
        category: menuCategories[0]?.id || "",
        description: "",
        imageUrl: "",
        price: 0,
        preparationTime: 10,
        dietary: [],
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        available: true
      });
      setFile(null);
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
      category: menuCategories[0]?.id || "",
      description: "",
      imageUrl: "",
      price: 0,
      preparationTime: 10,
      dietary: [],
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      available: true
    });
    setFile(null);
    setUploadError(null);
  };

  return (

    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <form onSubmit={AddMenu}>
          <DialogHeader>
            <DialogTitle>Add New Menu Item</DialogTitle>
            <DialogDescription>
              Create a new menu item with all details and specifications.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="item-image" className="mb-2">Item Image</Label>
              <Input
                id="item-image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) {
                    setFile(selectedFile);
                    setItemForm({ ...itemForm, imageUrl: URL.createObjectURL(selectedFile) });
                  }
                }}
              />
              {uploadError && <div className="text-destructive text-xs mt-2">{uploadError}</div>}
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
                <Select value={itemForm.category} onValueChange={(value) => setItemForm({ ...itemForm, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {menuCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                      price: e.target.value === "" ? 0 : parseFloat(e.target.value),
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
                      preparationTime: e.target.value === "" ? 0 : parseInt(e.target.value),
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
            <Button variant="outline" type="button" onClick={() => {
              setOpen(false);
              resetForm();
              
            }}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploading}>{uploading ? "Adding..." : "Add Item"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

  );
}
