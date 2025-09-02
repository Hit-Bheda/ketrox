CREATE TABLE "invoice" (
	"id" text PRIMARY KEY NOT NULL,
	"invoice_number" text NOT NULL,
	"order_id" text NOT NULL,
	"tenant_id" text NOT NULL,
	"admin_id" text,
	"customer_name" text NOT NULL,
	"table_number" text NOT NULL,
	"items" text[] NOT NULL,
	"quantities" text[] NOT NULL,
	"prices" text[] NOT NULL,
	"subtotal" text NOT NULL,
	"tax" text DEFAULT '0' NOT NULL,
	"total_amount" text NOT NULL,
	"payment_method" text DEFAULT 'cash' NOT NULL,
	"payment_status" text DEFAULT 'pending' NOT NULL,
	"notes" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "invoice_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
DROP TABLE "password_reset_token" CASCADE;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "prices" text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "payment_status" text DEFAULT 'unpaid' NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "subtotal" text NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "tax" text DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."order"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_admin_id_user_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;