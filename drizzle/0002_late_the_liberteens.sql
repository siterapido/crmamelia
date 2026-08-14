CREATE TABLE "lead_captures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" uuid NOT NULL,
	"contact_id" uuid,
	"deal_id" uuid,
	"city" varchar(120) NOT NULL,
	"ages" jsonb NOT NULL,
	"consent_at" timestamp NOT NULL,
	"page_url" text NOT NULL,
	"referrer" text,
	"utm_source" varchar(200),
	"utm_medium" varchar(200),
	"utm_campaign" varchar(200),
	"utm_content" varchar(200),
	"utm_term" varchar(200),
	"gclid" varchar(255),
	"fbclid" varchar(255),
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "lead_captures_request_id_unique" UNIQUE("request_id")
);
--> statement-breakpoint
ALTER TABLE "lead_captures" ADD CONSTRAINT "lead_captures_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_captures" ADD CONSTRAINT "lead_captures_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE set null ON UPDATE no action;