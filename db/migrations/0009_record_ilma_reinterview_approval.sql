-- ilma (Bangladesh, country pause) was approved after the 2026-10-02
-- re-interview, reported by the admin on 2026-10-23.
-- Matches the other refused-then-approved rows: interview_outcome keeps the
-- first result and resolution_outcome records the approval, so the generated
-- outcome_status moves from visa_pause to cleared.
-- The approval date was not reported, so visa_approval_date stays NULL rather
-- than assuming the re-interview day. RETURNING should list 1 row.
UPDATE public.form_responses AS f
  SET resolution_outcome = 'Cleared - Approved',
      notes = concat_ws(' | ', nullif(f.notes, ''),
                'Approved after the 2026-10-02 re-interview (reported to admin 2026-10-23); approval date not reported.')
  WHERE f.id = 93                                  -- ilma
    AND f.interview_change_type = 'Re-interview'
    AND f.resolution_outcome = 'Still Pending'
  RETURNING f.id, f.username_raw, f.resolution_outcome, f.outcome_status;
