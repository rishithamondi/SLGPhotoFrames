ALTER TYPE "public"."product_status" ADD VALUE 'inactive';--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "display_order" integer DEFAULT 0 NOT NULL;