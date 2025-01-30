-- Add generated columns for time durations
ALTER TABLE recons ADD COLUMN time_to_recon interval 
GENERATED ALWAYS AS (
  CASE 
    WHEN (timing_info->>'recon_time')::timestamptz IS NOT NULL 
    THEN ((timing_info->>'recon_time')::timestamptz - (timing_info->>'start_time')::timestamptz)
    ELSE NULL 
  END
) STORED;

ALTER TABLE recons ADD COLUMN time_to_export interval 
GENERATED ALWAYS AS (
  CASE 
    WHEN (timing_info->>'export_time')::timestamptz IS NOT NULL 
    THEN ((timing_info->>'export_time')::timestamptz - (timing_info->>'start_time')::timestamptz)
    ELSE NULL 
  END
) STORED;

-- Create index on start_time for better query performance
CREATE INDEX idx_recons_start_time ON recons ((timing_info->>'start_time')::timestamptz);