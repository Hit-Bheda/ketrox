
import {
  pgTable,
  text,
  timestamp,
  boolean,
  varchar,
} from "drizzle-orm/pg-core";

/* 1) PARENT FIRST */
export const tenants = pgTable('tenants', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  logo_url: text('logo_url').notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  owner_name: varchar('owner_name', { length: 255 }).notNull(),
  owner_phone: varchar('phone', { length: 256 }).notNull(),
  address: text('address'),
  plan: text('plan', {            
    enum: ["free", "standard"]
  }).notNull().default("free"),
  status: text('status', { enum: ["active", "trial", "suspended", "expired"] }).notNull().default("active"),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdateFn(() => new Date()),
});

/* 2) CHILD OF tenants */
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  tenant_id: text("tenant_id")
    .references(() => tenants.id),
  role: text("role", {
    enum: ["super-admin", "admin", "manager", "waiter"]
  }).notNull().default("waiter"),
  status: text("status", { enum: ["active", "inactive"] })
    .notNull()
    .default("active"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

/* 3) CHILDREN OF user */
export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

/* 4) NO FKs */
export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
});

/* 5) OTHER CHILDREN OF tenants */
export const table = pgTable("table", {
  id: text("id").primaryKey(),
  number: text("number").notNull(),
  name: text("name").notNull(),
  capacity: text("capacity").notNull(),
  notes: text("notes"),
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  available: boolean("available").notNull().default(true),
  maintenance: boolean("maintenance").notNull().default(false),
  qrCodeUrl: text("qr_code_url"),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
});

export const menu = pgTable("menu", {
  id: text("id").primaryKey(),
  item_logo: text("item_logo").array().notNull(),
  item_name: text("item_name").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  price: text("price").notNull(),
  prepTime: text("prep_time").notNull(),
  dietary: text("dietary").array().notNull(),
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  isAvailable: boolean("is_available").$defaultFn(() => true).notNull(),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
});


export const order = pgTable("order", {
  id: text("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  tableId: text("table_id").notNull().references(() => table.id),
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  managerId: text("manager_id").references(() => user.id),
  customerName: text("customer_name").notNull(),
  items: text("items").array().notNull(),
  quantity: text("quantity").array().notNull(),
  prices: text("prices").array().notNull(),
  status: text("status", { enum: ["pending", "preparing", "delivered", "cancelled"] })
    .notNull()
    .default("pending"),
  paymentStatus: text("payment_status", { enum: ["unpaid", "paid", "refunded"] })
    .notNull()
    .default("unpaid"),
  subtotal: text("subtotal").notNull(),
  tax: text("tax").notNull().default("0"),
  totalPrice: text("total_price").notNull(),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
});

export const invoice = pgTable("invoice", {
  id: text("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  orderId: text("order_id").references(() => order.id),
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  adminId: text("admin_id").references(() => user.id),
  customerName: text("customer_name").notNull(),
  tableNumber: text("table_number").notNull(),
  items: text("items").array().notNull(),
  quantities: text("quantities").array().notNull(),
  prices: text("prices").array().notNull(),
  subtotal: text("subtotal").notNull(),
  totalAmount: text("total_amount").notNull(),
  paymentMethod: text("payment_method", { enum: ["cash", "card", "upi", "Bank Transfer"] })
    .notNull()
    .default("cash"),
  paymentStatus: text("payment_status", { enum: ["pending", "paid", "failed", "refunded"] })
    .notNull()
    .default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
});


export const qr_codes = pgTable("qr_codes", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  url: text("url").notNull(),
  qrPath: text("qr_path"),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
});
