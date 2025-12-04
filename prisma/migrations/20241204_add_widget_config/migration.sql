-- CreateTable: widget_configs
CREATE TABLE "widget_configs" (
    "id" TEXT NOT NULL,
    "agency_id" TEXT NOT NULL,
    "widget_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'bubble',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "theme_name" TEXT NOT NULL DEFAULT 'default',
    "primary_color" TEXT NOT NULL DEFAULT '#2563eb',
    "secondary_color" TEXT,
    "background_color" TEXT NOT NULL DEFAULT '#ffffff',
    "text_color" TEXT NOT NULL DEFAULT '#1f2937',
    "font_family" TEXT NOT NULL DEFAULT 'system-ui',
    "border_radius" TEXT NOT NULL DEFAULT '8px',
    "button_style" TEXT NOT NULL DEFAULT 'rounded',
    "bubble_position" TEXT NOT NULL DEFAULT 'bottom-right',
    "bubble_icon" TEXT,
    "show_badge" BOOLEAN NOT NULL DEFAULT true,
    "bubble_animation" TEXT NOT NULL DEFAULT 'pulse',
    "inline_height" TEXT NOT NULL DEFAULT '600px',
    "show_header" BOOLEAN NOT NULL DEFAULT true,
    "show_border" BOOLEAN NOT NULL DEFAULT true,
    "custom_css" TEXT,
    "logo_url" TEXT,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "leads_generated" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "widget_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "widget_configs_widget_id_key" ON "widget_configs"("widget_id");

-- CreateIndex
CREATE INDEX "widget_configs_agency_id_idx" ON "widget_configs"("agency_id");

-- CreateIndex
CREATE INDEX "widget_configs_widget_id_idx" ON "widget_configs"("widget_id");

-- CreateIndex
CREATE INDEX "widget_configs_is_active_idx" ON "widget_configs"("is_active");

-- AddForeignKey
ALTER TABLE "widget_configs" ADD CONSTRAINT "widget_configs_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
