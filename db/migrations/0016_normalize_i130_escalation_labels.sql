-- Two rows stored short escalation labels that don't match the Fillout
-- option wording, which split counts by escalation type. Rewrite them to the
-- form labels. Guarded on the old value. Applied via execute_sql on 2026-11-21.
UPDATE public.form_responses
  SET i130_escalation = '["Congressional inquiry (asked my US Representative or Senator to contact USCIS)"]'::jsonb
  WHERE id = 368 AND i130_escalation = '["Congressional inquiry"]'::jsonb;   -- skowih

UPDATE public.form_responses
  SET i130_escalation = '["Congressional inquiry (asked my US Representative or Senator to contact USCIS)", "Attorney or self-generated demand letter (pre-lawsuit)", "White House inquiry"]'::jsonb
  WHERE id = 378 AND i130_escalation = '["Congressional inquiry", "Demand letter", "White House inquiry"]'::jsonb;   -- rapputk
