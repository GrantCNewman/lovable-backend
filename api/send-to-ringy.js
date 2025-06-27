export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { phone_number, full_name, email, lead_source } = req.body;

  const ringyPayload = {
    sid: process.env.RINGY_SID,
    authToken: process.env.RINGY_AUTH_TOKEN,
    phone_number,
    full_name,
    email,
    lead_source
  };

  try {
    const response = await fetch('https://app.ringy.com/api/public/leads/new-lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ringyPayload)
    });

    const result = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({ message: 'Error sending to Ringy', error: result });
    }

    return res.status(200).json({ message: 'Success', response: result });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
}
