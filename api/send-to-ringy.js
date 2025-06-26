export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  try {
    const {
      full_name,
      phone_number,
      email,
      city,
      state,
      street_address,
      birthday,
      lead_source
    } = req.body;

    const payload = {
      sid: process.env.RINGY_SID,
      authToken: process.env.RINGY_AUTH_TOKEN,
      full_name,
      phone_number,
      email,
      city,
      state,
      street_address,
      birthday,
      lead_source
    };

    const ringyRes = await fetch("https://app.ringy.com/api/public/leads/new-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await ringyRes.json();

    if (!ringyRes.ok) return res.status(ringyRes.status).json({ error: data });

    res.status(200).json({ success: true, ringyData: data });
  } catch (err) {
    res.status(500).json({ error: "Failed to send to Ringy", details: err.message });
  }
}
