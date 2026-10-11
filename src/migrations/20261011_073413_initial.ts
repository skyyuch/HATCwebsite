import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('zh-Hant', 'zh-Hans', 'en');
  CREATE TYPE "public"."enum_faqs_category" AS ENUM('trading', 'products', 'accounts', 'platforms', 'general');
  CREATE TYPE "public"."enum_instruments_category" AS ENUM('metals', 'forex', 'indices', 'energy', 'other');
  CREATE TYPE "public"."enum_account_benefits_icon" AS ENUM('percent', 'zap', 'creditCard', 'monitor');
  CREATE TYPE "public"."enum_funding_methods_type" AS ENUM('deposit', 'withdrawal');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"role_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "roles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"full_access" boolean DEFAULT false,
  	"can_home_activities_create" boolean,
  	"can_home_activities_update" boolean,
  	"can_home_activities_delete" boolean,
  	"fld_home_activities_enabled_update" boolean,
  	"can_faqs_create" boolean,
  	"can_faqs_update" boolean,
  	"can_faqs_delete" boolean,
  	"fld_faqs_enabled_update" boolean,
  	"can_academy_articles_create" boolean,
  	"can_academy_articles_update" boolean,
  	"can_academy_articles_delete" boolean,
  	"fld_academy_articles_slug_update" boolean,
  	"fld_academy_articles_enabled_update" boolean,
  	"can_instruments_create" boolean,
  	"can_instruments_update" boolean,
  	"can_instruments_delete" boolean,
  	"fld_instruments_enabled_update" boolean,
  	"can_account_benefits_create" boolean,
  	"can_account_benefits_update" boolean,
  	"can_account_benefits_delete" boolean,
  	"fld_account_benefits_enabled_update" boolean,
  	"can_trading_platforms_create" boolean,
  	"can_trading_platforms_update" boolean,
  	"can_trading_platforms_delete" boolean,
  	"fld_trading_platforms_enabled_update" boolean,
  	"can_funding_methods_create" boolean,
  	"can_funding_methods_update" boolean,
  	"can_funding_methods_delete" boolean,
  	"fld_funding_methods_enabled_update" boolean,
  	"can_testimonials_create" boolean,
  	"can_testimonials_update" boolean,
  	"can_testimonials_delete" boolean,
  	"fld_testimonials_enabled_update" boolean,
  	"can_media_create" boolean,
  	"can_media_update" boolean,
  	"can_media_delete" boolean,
  	"can_users_read" boolean,
  	"can_users_create" boolean,
  	"can_users_update" boolean,
  	"can_users_delete" boolean,
  	"fld_users_role_update" boolean,
  	"can_site_settings_update" boolean,
  	"can_home_page_update" boolean,
  	"can_trading_page_update" boolean,
  	"can_about_page_update" boolean,
  	"can_products_page_update" boolean,
  	"can_funding_page_update" boolean,
  	"can_platforms_page_update" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "home_activities" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"href" varchar,
  	"date" timestamp(3) with time zone,
  	"order" numeric DEFAULT 0,
  	"enabled" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "home_activities_locales" (
  	"title" varchar NOT NULL,
  	"summary" varchar,
  	"tag" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "faqs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"category" "enum_faqs_category" DEFAULT 'trading' NOT NULL,
  	"order" numeric DEFAULT 0,
  	"enabled" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "faqs_locales" (
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "academy_articles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"cover_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"order" numeric DEFAULT 0,
  	"enabled" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "academy_articles_locales" (
  	"title" varchar NOT NULL,
  	"excerpt" varchar,
  	"body" jsonb,
  	"category" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "instruments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"symbol" varchar NOT NULL,
  	"category" "enum_instruments_category" DEFAULT 'metals' NOT NULL,
  	"order" numeric DEFAULT 0,
  	"enabled" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "instruments_locales" (
  	"name" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "account_benefits" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum_account_benefits_icon" DEFAULT 'percent' NOT NULL,
  	"order" numeric DEFAULT 0,
  	"enabled" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "account_benefits_locales" (
  	"title" varchar NOT NULL,
  	"desc" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "trading_platforms" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"panel_label" varchar,
  	"visual_id" integer,
  	"order" numeric DEFAULT 0,
  	"enabled" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "trading_platforms_locales" (
  	"name" varchar NOT NULL,
  	"tagline" varchar,
  	"desc" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "funding_methods" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum_funding_methods_type" DEFAULT 'withdrawal' NOT NULL,
  	"free" boolean DEFAULT false,
  	"order" numeric DEFAULT 0,
  	"enabled" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "funding_methods_locales" (
  	"method" varchar NOT NULL,
  	"time" varchar,
  	"fee" varchar,
  	"currencies" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "testimonials" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" numeric DEFAULT 0,
  	"enabled" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "testimonials_locales" (
  	"quote" varchar NOT NULL,
  	"author_name" varchar NOT NULL,
  	"author_title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"roles_id" integer,
  	"media_id" integer,
  	"home_activities_id" integer,
  	"faqs_id" integer,
  	"academy_articles_id" integer,
  	"instruments_id" integer,
  	"account_benefits_id" integer,
  	"trading_platforms_id" integer,
  	"funding_methods_id" integer,
  	"testimonials_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"whatsapp" varchar,
  	"phone" varchar,
  	"email" varchar,
  	"live_chat_url" varchar,
  	"demo_account_url" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "home_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "home_page_locales" (
  	"hero_badge" varchar,
  	"hero_title_line1" varchar,
  	"hero_title_brand" varchar,
  	"hero_title_tail" varchar,
  	"hero_subtitle" varchar,
  	"hero_cta_primary" varchar,
  	"services_kicker" varchar,
  	"services_heading" varchar,
  	"services_subheading" varchar,
  	"services_body" varchar,
  	"services_cta" varchar,
  	"mt5_kicker" varchar,
  	"mt5_heading" varchar,
  	"mt5_subheading" varchar,
  	"mt5_body" varchar,
  	"mt5_cta_primary" varchar,
  	"mt5_cta_secondary" varchar,
  	"why_kicker" varchar,
  	"why_heading" varchar,
  	"academy_kicker" varchar,
  	"academy_heading" varchar,
  	"story_kicker" varchar,
  	"story_heading" varchar,
  	"story_body" varchar,
  	"story_cta" varchar,
  	"support_kicker" varchar,
  	"support_heading" varchar,
  	"support_cta" varchar,
  	"final_heading" varchar,
  	"final_body" varchar,
  	"final_cta_primary" varchar,
  	"final_cta_secondary" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "trading_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "trading_page_locales" (
  	"hero_title_line1" varchar,
  	"hero_title_line2" varchar,
  	"hero_subtitle" varchar,
  	"services_badge" varchar,
  	"services_heading" varchar,
  	"services_subtitle" varchar,
  	"accounts_badge" varchar,
  	"accounts_heading" varchar,
  	"accounts_subtitle" varchar,
  	"pricing_badge" varchar,
  	"pricing_heading" varchar,
  	"pricing_subtitle" varchar,
  	"pricing_cta" varchar,
  	"faq_badge" varchar,
  	"faq_heading" varchar,
  	"faq_subtitle" varchar,
  	"cta_heading" varchar,
  	"cta_body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "about_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "about_page_locales" (
  	"hero_title_lead" varchar,
  	"hero_subtitle" varchar,
  	"identity_kicker" varchar,
  	"identity_heading" varchar,
  	"credentials_kicker" varchar,
  	"credentials_heading" varchar,
  	"principles_kicker" varchar,
  	"principles_heading" varchar,
  	"timeline_kicker" varchar,
  	"timeline_heading" varchar,
  	"hongkong_kicker" varchar,
  	"hongkong_heading_lead" varchar,
  	"hongkong_heading_accent" varchar,
  	"hongkong_body" varchar,
  	"gallery_kicker" varchar,
  	"gallery_heading" varchar,
  	"cta_heading" varchar,
  	"cta_body" varchar,
  	"cta_secondary" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "products_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "products_page_locales" (
  	"hero_title_lead" varchar,
  	"hero_title_accent" varchar,
  	"hero_title_tail" varchar,
  	"hero_subtitle" varchar,
  	"list_kicker" varchar,
  	"list_heading" varchar,
  	"list_subheading" varchar,
  	"conditions_kicker" varchar,
  	"conditions_heading" varchar,
  	"credibility_kicker" varchar,
  	"credibility_heading" varchar,
  	"cta_heading" varchar,
  	"cta_body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "funding_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_image_id" integer,
  	"deposit_image_id" integer,
  	"withdraw_image_id" integer,
  	"cta_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "funding_page_locales" (
  	"hero_title_lead" varchar,
  	"hero_title_accent" varchar,
  	"hero_title_tail" varchar,
  	"hero_subtitle" varchar,
  	"deposit_intro_heading" varchar,
  	"deposit_intro_body" varchar,
  	"deposit_methods_kicker" varchar,
  	"deposit_methods_heading" varchar,
  	"deposit_methods_note" varchar,
  	"withdraw_intro_heading" varchar,
  	"withdraw_intro_body" varchar,
  	"withdraw_methods_kicker" varchar,
  	"withdraw_methods_heading" varchar,
  	"withdraw_methods_note" varchar,
  	"topics_kicker" varchar,
  	"topics_heading" varchar,
  	"topics_subtitle" varchar,
  	"testimonials_kicker" varchar,
  	"testimonials_heading" varchar,
  	"testimonials_subtitle" varchar,
  	"cta_heading" varchar,
  	"cta_body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "platforms_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_activities" ADD CONSTRAINT "home_activities_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_activities_locales" ADD CONSTRAINT "home_activities_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_activities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faqs_locales" ADD CONSTRAINT "faqs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "academy_articles" ADD CONSTRAINT "academy_articles_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "academy_articles_locales" ADD CONSTRAINT "academy_articles_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."academy_articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "instruments_locales" ADD CONSTRAINT "instruments_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."instruments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "account_benefits_locales" ADD CONSTRAINT "account_benefits_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."account_benefits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "trading_platforms" ADD CONSTRAINT "trading_platforms_visual_id_media_id_fk" FOREIGN KEY ("visual_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "trading_platforms_locales" ADD CONSTRAINT "trading_platforms_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."trading_platforms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "funding_methods_locales" ADD CONSTRAINT "funding_methods_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."funding_methods"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "testimonials_locales" ADD CONSTRAINT "testimonials_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_roles_fk" FOREIGN KEY ("roles_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_home_activities_fk" FOREIGN KEY ("home_activities_id") REFERENCES "public"."home_activities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_academy_articles_fk" FOREIGN KEY ("academy_articles_id") REFERENCES "public"."academy_articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_instruments_fk" FOREIGN KEY ("instruments_id") REFERENCES "public"."instruments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_account_benefits_fk" FOREIGN KEY ("account_benefits_id") REFERENCES "public"."account_benefits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_trading_platforms_fk" FOREIGN KEY ("trading_platforms_id") REFERENCES "public"."trading_platforms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_funding_methods_fk" FOREIGN KEY ("funding_methods_id") REFERENCES "public"."funding_methods"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_testimonials_fk" FOREIGN KEY ("testimonials_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_page_locales" ADD CONSTRAINT "home_page_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "trading_page_locales" ADD CONSTRAINT "trading_page_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."trading_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "about_page_locales" ADD CONSTRAINT "about_page_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."about_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_page_locales" ADD CONSTRAINT "products_page_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "funding_page" ADD CONSTRAINT "funding_page_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "funding_page" ADD CONSTRAINT "funding_page_deposit_image_id_media_id_fk" FOREIGN KEY ("deposit_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "funding_page" ADD CONSTRAINT "funding_page_withdraw_image_id_media_id_fk" FOREIGN KEY ("withdraw_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "funding_page" ADD CONSTRAINT "funding_page_cta_image_id_media_id_fk" FOREIGN KEY ("cta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "funding_page_locales" ADD CONSTRAINT "funding_page_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."funding_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "platforms_page" ADD CONSTRAINT "platforms_page_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_role_idx" ON "users" USING btree ("role_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "roles_name_idx" ON "roles" USING btree ("name");
  CREATE INDEX "roles_updated_at_idx" ON "roles" USING btree ("updated_at");
  CREATE INDEX "roles_created_at_idx" ON "roles" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "home_activities_image_idx" ON "home_activities" USING btree ("image_id");
  CREATE INDEX "home_activities_updated_at_idx" ON "home_activities" USING btree ("updated_at");
  CREATE INDEX "home_activities_created_at_idx" ON "home_activities" USING btree ("created_at");
  CREATE UNIQUE INDEX "home_activities_locales_locale_parent_id_unique" ON "home_activities_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "faqs_updated_at_idx" ON "faqs" USING btree ("updated_at");
  CREATE INDEX "faqs_created_at_idx" ON "faqs" USING btree ("created_at");
  CREATE UNIQUE INDEX "faqs_locales_locale_parent_id_unique" ON "faqs_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "academy_articles_slug_idx" ON "academy_articles" USING btree ("slug");
  CREATE INDEX "academy_articles_cover_idx" ON "academy_articles" USING btree ("cover_id");
  CREATE INDEX "academy_articles_updated_at_idx" ON "academy_articles" USING btree ("updated_at");
  CREATE INDEX "academy_articles_created_at_idx" ON "academy_articles" USING btree ("created_at");
  CREATE UNIQUE INDEX "academy_articles_locales_locale_parent_id_unique" ON "academy_articles_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "instruments_updated_at_idx" ON "instruments" USING btree ("updated_at");
  CREATE INDEX "instruments_created_at_idx" ON "instruments" USING btree ("created_at");
  CREATE UNIQUE INDEX "instruments_locales_locale_parent_id_unique" ON "instruments_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "account_benefits_updated_at_idx" ON "account_benefits" USING btree ("updated_at");
  CREATE INDEX "account_benefits_created_at_idx" ON "account_benefits" USING btree ("created_at");
  CREATE UNIQUE INDEX "account_benefits_locales_locale_parent_id_unique" ON "account_benefits_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "trading_platforms_visual_idx" ON "trading_platforms" USING btree ("visual_id");
  CREATE INDEX "trading_platforms_updated_at_idx" ON "trading_platforms" USING btree ("updated_at");
  CREATE INDEX "trading_platforms_created_at_idx" ON "trading_platforms" USING btree ("created_at");
  CREATE UNIQUE INDEX "trading_platforms_locales_locale_parent_id_unique" ON "trading_platforms_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "funding_methods_type_idx" ON "funding_methods" USING btree ("type");
  CREATE INDEX "funding_methods_updated_at_idx" ON "funding_methods" USING btree ("updated_at");
  CREATE INDEX "funding_methods_created_at_idx" ON "funding_methods" USING btree ("created_at");
  CREATE UNIQUE INDEX "funding_methods_locales_locale_parent_id_unique" ON "funding_methods_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "testimonials_updated_at_idx" ON "testimonials" USING btree ("updated_at");
  CREATE INDEX "testimonials_created_at_idx" ON "testimonials" USING btree ("created_at");
  CREATE UNIQUE INDEX "testimonials_locales_locale_parent_id_unique" ON "testimonials_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_roles_id_idx" ON "payload_locked_documents_rels" USING btree ("roles_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_home_activities_id_idx" ON "payload_locked_documents_rels" USING btree ("home_activities_id");
  CREATE INDEX "payload_locked_documents_rels_faqs_id_idx" ON "payload_locked_documents_rels" USING btree ("faqs_id");
  CREATE INDEX "payload_locked_documents_rels_academy_articles_id_idx" ON "payload_locked_documents_rels" USING btree ("academy_articles_id");
  CREATE INDEX "payload_locked_documents_rels_instruments_id_idx" ON "payload_locked_documents_rels" USING btree ("instruments_id");
  CREATE INDEX "payload_locked_documents_rels_account_benefits_id_idx" ON "payload_locked_documents_rels" USING btree ("account_benefits_id");
  CREATE INDEX "payload_locked_documents_rels_trading_platforms_id_idx" ON "payload_locked_documents_rels" USING btree ("trading_platforms_id");
  CREATE INDEX "payload_locked_documents_rels_funding_methods_id_idx" ON "payload_locked_documents_rels" USING btree ("funding_methods_id");
  CREATE INDEX "payload_locked_documents_rels_testimonials_id_idx" ON "payload_locked_documents_rels" USING btree ("testimonials_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE UNIQUE INDEX "home_page_locales_locale_parent_id_unique" ON "home_page_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "trading_page_locales_locale_parent_id_unique" ON "trading_page_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "about_page_locales_locale_parent_id_unique" ON "about_page_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "products_page_locales_locale_parent_id_unique" ON "products_page_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "funding_page_hero_image_idx" ON "funding_page" USING btree ("hero_image_id");
  CREATE INDEX "funding_page_deposit_image_idx" ON "funding_page" USING btree ("deposit_image_id");
  CREATE INDEX "funding_page_withdraw_image_idx" ON "funding_page" USING btree ("withdraw_image_id");
  CREATE INDEX "funding_page_cta_image_idx" ON "funding_page" USING btree ("cta_image_id");
  CREATE UNIQUE INDEX "funding_page_locales_locale_parent_id_unique" ON "funding_page_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "platforms_page_hero_image_idx" ON "platforms_page" USING btree ("hero_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "roles" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "home_activities" CASCADE;
  DROP TABLE "home_activities_locales" CASCADE;
  DROP TABLE "faqs" CASCADE;
  DROP TABLE "faqs_locales" CASCADE;
  DROP TABLE "academy_articles" CASCADE;
  DROP TABLE "academy_articles_locales" CASCADE;
  DROP TABLE "instruments" CASCADE;
  DROP TABLE "instruments_locales" CASCADE;
  DROP TABLE "account_benefits" CASCADE;
  DROP TABLE "account_benefits_locales" CASCADE;
  DROP TABLE "trading_platforms" CASCADE;
  DROP TABLE "trading_platforms_locales" CASCADE;
  DROP TABLE "funding_methods" CASCADE;
  DROP TABLE "funding_methods_locales" CASCADE;
  DROP TABLE "testimonials" CASCADE;
  DROP TABLE "testimonials_locales" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "home_page" CASCADE;
  DROP TABLE "home_page_locales" CASCADE;
  DROP TABLE "trading_page" CASCADE;
  DROP TABLE "trading_page_locales" CASCADE;
  DROP TABLE "about_page" CASCADE;
  DROP TABLE "about_page_locales" CASCADE;
  DROP TABLE "products_page" CASCADE;
  DROP TABLE "products_page_locales" CASCADE;
  DROP TABLE "funding_page" CASCADE;
  DROP TABLE "funding_page_locales" CASCADE;
  DROP TABLE "platforms_page" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_faqs_category";
  DROP TYPE "public"."enum_instruments_category";
  DROP TYPE "public"."enum_account_benefits_icon";
  DROP TYPE "public"."enum_funding_methods_type";`)
}
