export default async function handler(req, res) {
  // ✅ Step 1: Allow requests from your frontend domain (Lovable)
  res.setHeader('Access-Control-Allow-Origin', 'https://69830664-34f8-45fc-a103-75b5ff1557e4.lovableproject.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // ✅ Step 2: Respond early to preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ✅ Step 3: Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const body = req.body;

  try {
    // ✅ Send to Ringy
    const ringyRes = await fetch('https://app.ringy.com/api/public/leads/new-lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const ringyText = await ringyRes.text();

    if (!ringyRes.ok) {
      return res.status(ringyRes.status).json({
        message: 'Error sending to Ringy',
        error: ringyText
      });
    }

    // ✅ Also send to Google Sheets
    await fetch('https://api.sheetbest.com/sheets/4393fe29-9352-4fd1-a7ea-226c4729c6b2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    // ✅ Respond with Ringy response
    return res.status(200).json(JSON.parse(ringyText));
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}
