export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ message: "Method Not Allowed" });

  try {
    const {
      phone_number,
      full_name,
      email,
      city,
      state,
      street_address,
      birthday,
      lead_source
    } = req.body;

    if (!phone_number || !full_name || !email || !city || !state || !street_address || !birthday || !lead_source) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const ringyPayload = {
      sid: process.env.RINGY_SID,
      authToken: process.env.RINGY_AUTH_TOKEN,
      phone_number,
      full_name,
      email,
      city,
      state,
      street_address,
      birthday,
      lead_source
    };

    const response = await fetch("https://app.ringy.com/api/public/leads/new-lead", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(ringyPayload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Ringy API Error:", data);
      return res.status(response.status).json({ message: "Error sending to Ringy", error: data });
    }

    return res.status(200).json({ success: true, vendorResponseId: data.vendorResponseId });
  } catch (error) {
    console.error("❌ Server Error:", error.message);
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
}
