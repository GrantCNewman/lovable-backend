export default async function handler(req, res) {
  // 🔐 CORS setup
  res.setHeader('Access-Control-Allow-Origin', 'https://69830664-34f8-45fc-a103-75b5ff1557e4.lovableproject.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Only POST requests allowed' });

  const body = req.body;

  // 🧠 Add Ringy credentials
  const ringyPayload = {
    sid: "iScr0scg0j54eb2chm4n1cht6iz6307s",
    authToken: "zy7njfzutv2ovwmx6dsc3e9yim0d09jf",
    phone_number: body.phone_number,
    full_name: body.full_name,
    email: body.email,
    city: body.city,
    state: body.state,
    street_address: body.street_address,
    birthday: body.birthday,
    lead_source: body.lead_source
  };

  try {
    // ✅ Send to Ringy
    const ringyRes = await fetch('https://app.ringy.com/api/public/leads/new-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ringyPayload)
    });

    const ringyText = await ringyRes.text();

    if (!ringyRes.ok) {
      return res.status(ringyRes.status).json({
        message: 'Error sending to Ringy',
        error: ringyText
      });
    }

    // ✅ Send to Google Sheets
    await fetch('https://api.sheetbest.com/sheets/4393fe29-9352-4fd1-a7ea-226c4729c6b2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    return res.status(200).json(JSON.parse(ringyText));
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}
