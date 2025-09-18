

export enum HotelStatus {
  Active = "active",
  Trial = "trial",
  Suspended = "suspended",
  Expired = "expired"
}

export enum HotelPlan {
  Free = "free",
  Standard = "standard",
  Pro = "pro"
}

export type StatusColorStyles = {
  [key: string]: string; 
};

export type PlanColorStyles = {
  [key: string]: string; 
};

export interface HotelType {
  id: string;
  name: string;
  owner_name: string; 
  owner_phone: string; 
  plan: string; 
  address: string;
  status: string; 
  created_at: string; 
  logo_url: string;
  email: string;
}

export type StaffType = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "super-admin" | "admin" | "manager" | "waiter";
  status: "active" | "inactive";
  tenant_id: string | null;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type TableType = {
  id: string;
  number: string;
  name: string;
  capacity: string;
  notes?: string;
  available: boolean;
  maintenance: boolean;
  status?: "available" | "occupied" | "unavailable" | string;
};

export type DietaryOption = "vegetarian" | "vegan" | "glutenFree";

export type MenuItem = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: string | "";
  preparationTime: string | "";
  dietary: DietaryOption[];
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  available: boolean;
  image?: string[];
};

export type ApiMenuItem = {
    id: string;
    item_name?: string;
    name?: string;
    category: string;
    description: string;
    price: | "";
    preparationTime: number | "";
    item_logo?: string;
    image?: string[];
    prepTime?: number | string;
    dietaty?: DietaryOption[];
    dietary?: DietaryOption[];
    isAvailable?: boolean;
  };

export type OrderType = {
  id: string;
  tableId: string;
  tableNumber: string;
  tenantId: string;
  managerId: string;
  customerName: string;
  customerPhone: string;
  items: string[];
  quantity: string[];
  tax: string;
  status: "pending" | "completed" | "cancelled" | string;
  totalPrice: string;
  createdAt: string;
  updatedAt: string;
  managerName: string;
  orderNumber: string;
  itemNames: string[];
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  tableNumber: string;
  items: string[];
  quantities: string[];
  prices: string[];
  subtotal: string;
  totalAmount: string;
  paymentMethod: string;
  paymentStatus: string;
  notes?: string;
  createdAt: string;
};

export type QrCodeType = {
  id: string;
  tenantId: string;
  url: string;
  qrPath: string | null;
  createdAt: string; 
  updatedAt: string;
};

export type UserType = {
  id?: string;
  name: string;
  email: string;
  phone: string | null;
};

