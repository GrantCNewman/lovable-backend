export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ message: "Method Not Allowed" });

  try {
    const {
      full_name,
      phone_number,
      email,
      birthday,
      city,
      state,
      street_address,
      lead_source
    } = req.body;

    if (!full_name || !phone_number || !email || !birthday || !city || !state || !street_address || !lead_source) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const payload = {
      sid: process.env.RINGY_SID,
      authToken: process.env.RINGY_AUTH_TOKEN,
      full_name,
      phone_number,
      email,
      birthday,
      city,
      state,
      street_address,
      lead_source
    };

    const ringyRes = await fetch("https://app.ringy.com/api/public/leads/new-lead", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await ringyRes.json();

    if (!ringyRes.ok) {
      console.error("❌ Ringy Error:", data);
      return res.status(ringyRes.status).json({ message: "Error sending to Ringy", error: data });
    }

    return res.status(200).json({ success: true, vendorResponseId: data.vendorResponseId });
  } catch (err) {
    console.error("❌ Server error:", err.message);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}
