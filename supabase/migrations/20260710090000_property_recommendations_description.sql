-- Each AI-curated place needs a short Claude-written description (what
-- makes it stand out, drawn only from real Google Places data) — this
-- column was missing from the original schema.
alter table property_recommendations add column description text;
