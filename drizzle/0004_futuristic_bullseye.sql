CREATE TABLE "account_plain_password" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"plain_password" text NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "login_activity" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"tenant_id" text,
	"login_time" timestamp with time zone NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"session_id" text,
	"login_method" text DEFAULT 'email' NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "invoice" ADD COLUMN "customer_phone" text NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "customer_phone" text NOT NULL;--> statement-breakpoint
ALTER TABLE "ticket_message" ADD COLUMN "updated_at" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "account_plain_password" ADD CONSTRAINT "account_plain_password_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "login_activity" ADD CONSTRAINT "login_activity_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "login_activity" ADD CONSTRAINT "login_activity_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "login_activity" ADD CONSTRAINT "login_activity_session_id_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."session"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "plain_password";