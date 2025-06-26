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

    // Validate required fields
    if (!phone_number || !full_name || !email || !city || !state || !street_address || !birthday || !lead_source) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create payload in Ringy's expected format
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

    const ringyRes = await fetch("https://app.ringy.com/api/public/leads/new-lead", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(ringyPayload)
    });

    const data = await ringyRes.json();

    if (!ringyRes.ok) {
      console.error("❌ Ringy error:", data);
      return res.status(ringyRes.status).json({ message: "Ringy rejected the request", error: data });
    }

    return res.status(200).json({ success: true, vendorResponseId: data.vendorResponseId });
  } catch (err) {
    console.error("❌ Server error:", err.message);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
}
