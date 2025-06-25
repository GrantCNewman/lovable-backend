export default async function handler(req, res) {
  // ✅ CORS Headers
  res.setHeader('Access-Control-Allow-Origin', 'https://69830664-34f8-45fc-a103-75b5ff1557e4.lovableproject.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // ✅ Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ✅ Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const body = req.body;

  try {
    // ✅ Send to Ringy
    const ringyResponse = await fetch('https://app.ringy.com/api/public/leads/new-lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const ringyText = await ringyResponse.text();

    if (!ringyResponse.ok) {
      return res.status(ringyResponse.status).json({
        message: 'Error sending to Ringy',
        error: ringyText
      });
    }

    // ✅ Send to Google Sheets via SheetBest
    const sheetResponse = await fetch('https://api.sheetbest.com/sheets/4393fe29-9352-4fd1-a7ea-226c4729c6b2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!sheetResponse.ok) {
      const sheetText = await sheetResponse.text();
      console.error("❌ Failed to send to SheetBest:", sheetText);
      // Still return success to frontend, but log SheetBest issue
    }

    // ✅ All good
    return res.status(200).json(JSON.parse(ringyText));
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}
