export default async function handler(req, res) {
  // 🔐 Allow requests from your frontend domain
  res.setHeader('Access-Control-Allow-Origin', 'https://69830664-34f8-45fc-a103-75b5ff1557e4.lovableproject.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // ✅ Respond to CORS preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const body = req.body;

  try {
    const response = await fetch('https://app.ringy.com/api/public/leads/new-lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const text = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        message: 'Error sending to Ringy',
        error: text
      });
    }

    return res.status(200).json(JSON.parse(text));
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}
