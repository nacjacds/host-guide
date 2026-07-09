-- Stores geocoded coordinates for a property's address, used to search
-- nearby places and compute real distances for local recommendations.
alter table properties add column lat numeric;
alter table properties add column lng numeric;
