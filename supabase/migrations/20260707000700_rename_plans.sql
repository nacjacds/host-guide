-- Renames the 'basic' plan tier to 'starter' and adds the new 'agency' tier.
-- lib/plans.ts is the single source of truth for plan pricing/limits/guards
-- from this point on — this migration just keeps the DB constraint in sync.
update profiles set plan = 'starter' where plan = 'basic';

alter table profiles drop constraint profiles_plan_check;
alter table profiles add constraint profiles_plan_check
  check (plan in ('free', 'starter', 'pro', 'agency'));
