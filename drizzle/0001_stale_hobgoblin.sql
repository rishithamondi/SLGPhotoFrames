CREATE INDEX "slug_idx" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "category_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "price_idx" ON "products" USING btree ("base_price");--> statement-breakpoint
CREATE INDEX "featured_idx" ON "products" USING btree ("featured");--> statement-breakpoint
CREATE INDEX "popular_idx" ON "products" USING btree ("popular");--> statement-breakpoint
CREATE INDEX "status_idx" ON "products" USING btree ("status");