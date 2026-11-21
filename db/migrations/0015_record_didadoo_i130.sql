-- didadoo: new row (id 381) added by the admin from a Discord report
-- (2026-11-19 17:41 UK). USC petitioner, British spouse, London.
-- Petitioner interview 2026-11-18, I-130 approved 2026-11-19.
-- Escalation labels match the Fillout option wording exactly.
-- Applied via execute_sql on 2026-11-21.
INSERT INTO public.form_responses
  (username_raw, visa_category, embassy, i130_priority_date, i130_rfe,
   i130_interview, i130_interview_date, i130_approval, i130_escalation, notes, submitted_at)
VALUES
  ('didadoo', 'CR1/IR1', 'London, United Kingdom', '2024-12-08', false,
   true, '2026-11-18', '2026-11-19',
   '["USCIS expedite request", "Congressional inquiry (asked my US Representative or Senator to contact USCIS)", "Attorney or self-generated demand letter (pre-lawsuit)", "Writ of mandamus filed in federal court"]'::jsonb,
   'K-3 filed Jul 2025. Pro se WOM filed 2026-09-18; petitioner interview notice 2026-11-03. AUSA reported approval before USCIS updated. Source: Discord 2026-11-19 (admin entry).',
   '2026-11-19 17:41:00+00');
