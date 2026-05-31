export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'ok' })
  }
  if (req.method !== 'POST') return res.status(405).end()

  const raw = req.body

  // Convert empty strings and arrays to null
  const cleaned = Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [
      key,
      value === '' || (Array.isArray(value) && value.length === 0) ? null : value
    ])
  )

  const username = cleaned.username_raw?.trim?.() || null

  const baseHeaders = {
    'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  // Always update submitted_at
  cleaned.submitted_at = new Date().toISOString()

  if (username) {
    // Normalise username to lowercase
    cleaned.username_raw = username.toLowerCase()

    // Strip null values so we never overwrite existing data with nulls on update
    const payload = Object.fromEntries(
      Object.entries(cleaned).filter(([_, v]) => v !== null && v !== undefined)
    )

    // Atomic upsert — inserts if no matching username_raw, updates non-null fields if one exists.
    // ignoreDuplicates=false + merge-duplicates means conflicting rows are updated, not skipped.
    const upsertRes = await fetch(
      `${supabaseUrl}/rest/v1/form_responses`,
      {
        method: 'POST',
        headers: {
          ...baseHeaders,
          'Prefer': 'resolution=merge-duplicates,return=minimal'
        },
        body: JSON.stringify(payload)
      }
    )

    if (!upsertRes.ok) {
      const error = await upsertRes.text()
      return res.status(500).json({ error })
    }

    return res.status(200).json({ success: true, action: 'upserted' })

  } else {
    // No username — plain insert
    const insertRes = await fetch(
      `${supabaseUrl}/rest/v1/form_responses?on_conflict=username_raw`,
      {
        method: 'POST',
        headers: { ...baseHeaders, 'Prefer': 'return=minimal' },
        body: JSON.stringify(cleaned)
      }
    )

    if (!insertRes.ok) {
      const error = await insertRes.text()
      return res.status(500).json({ error })
    }

    return res.status(200).json({ success: true, action: 'inserted' })
  }
}
