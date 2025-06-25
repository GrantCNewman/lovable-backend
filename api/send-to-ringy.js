export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const lead = req.body;

  // Replace with your actual Ringy API details
  const RINGY_ENDPOINT = 'https://app.ringy.com/api/public/leads/new-lead';

  try {
    const response = await fetch(RINGY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sid: "YOUR_SID_HERE",
        authToken: "YOUR_AUTH_TOKEN_HERE",
        full_name: lead.full_name,
        phone_number: lead.phone_number,
        email: lead.email,
        city: lead.city,
        state: lead.state,
        street_address: lead.street_address,
        birthday: lead.birthday,
        lead_source: lead.lead_source
      })
    });

    const data = await response.json();
    res.status(200).json({ message: "Lead sent to Ringy", data });

  } catch (error) {
    res.status(500).json({ message: "Error sending to Ringy", error: error.message });
  }
}

