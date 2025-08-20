ALTER TABLE "table" ADD COLUMN "available" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "table" ADD COLUMN "maintenance" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "table" ADD COLUMN "qr_code_url" text;