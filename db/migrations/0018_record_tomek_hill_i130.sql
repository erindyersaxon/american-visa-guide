-- tomek hill: new row (id 382) added by the admin from a Discord report
-- (2026-10-08 11:31 BST). USC petitioner, UK spouse, London. No RFE, no
-- petitioner interview, no K-3. I-130 approved 2026-10-08. The report answered
-- "Demand/WOM/Expedite? No" and separately said the petitioner contacted their
-- congresswoman's office, recorded as a congressional inquiry.
-- Applied via execute_sql on 2026-11-21.
INSERT INTO public.form_responses
  (username_raw, visa_category, embassy, i130_priority_date, i130_rfe, i130_interview,
   i130_approval, i130_escalation, notes, submitted_at)
VALUES
  ('tomek hill', 'CR1/IR1', 'London, United Kingdom', '2025-09-05', false, false,
   '2026-10-08',
   '["Congressional inquiry (asked my US Representative or Senator to contact USCIS)"]'::jsonb,
   'USC petitioner, UK spouse. No K-3. Congressional inquiry via a New Hampshire representative''s office; petitioner believes it sped up the approval. Source: Discord 2026-10-08 (admin entry).',
   '2026-10-08 10:31:00+00');
