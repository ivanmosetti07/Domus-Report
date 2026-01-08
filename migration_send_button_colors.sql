-- Migration: Add send button color customization fields
-- Date: 2026-01-08
-- Description: Adds sendButtonColor and sendButtonIconColor fields to widget_configs table

-- Add new columns
ALTER TABLE widget_configs 
ADD COLUMN send_button_color VARCHAR(255),
ADD COLUMN send_button_icon_color VARCHAR(255);

-- Optional: Set default values for existing widgets
-- UPDATE widget_configs 
-- SET send_button_color = primary_color, 
--     send_button_icon_color = '#ffffff'
-- WHERE send_button_color IS NULL;
