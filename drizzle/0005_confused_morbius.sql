CREATE TABLE "menu" (
	"id" text PRIMARY KEY NOT NULL,
	"Item_logo" text NOT NULL,
	"item_name" text NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"price" text NOT NULL,
	"prep_time" text NOT NULL,
	"dietary" text[] NOT NULL,
	"tenant_id" text NOT NULL,
	"is_available" boolean NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "table" (
	"id" text PRIMARY KEY NOT NULL,
	"number" text NOT NULL,
	"name" text NOT NULL,
	"capacity" text NOT NULL,
	"notes" text,
	"tenant_id" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "menu" ADD CONSTRAINT "menu_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "table" ADD CONSTRAINT "table_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;