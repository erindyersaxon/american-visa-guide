// Fillout answers that need converting before they reach form_responses.
// Every other webhook key is written to the column of the same name as-is.

// Dropdown answers stored in boolean columns. Fillout sends the option label.
const BOOLEAN_FIELDS = ['i130_interview']

export function toBoolean(value) {
  if (value === true || value === false) return value
  if (value === null || value === undefined) return null
  const v = String(value).trim().toLowerCase()
  if (v === 'yes' || v === 'true') return true
  if (v === 'no' || v === 'false') return false
  return null
}

export function normalizeFields(row) {
  const out = { ...row }
  for (const key of BOOLEAN_FIELDS) {
    if (key in out) out[key] = toBoolean(out[key])
  }
  return out
}
