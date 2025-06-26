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
      birthday,
      city,
      state,
      street_address,
      lead_source
    } = req.body;

    // Ensure all required fields are present
    if (!phone_number || !full_name || !email || !birthday || !city || !state || !street_address || !lead_source) {
      return res.status(400).json({ error: "Missing required fields for Ringy" });
    }

    // Only send the exact fields Ringy expects
    const ringyPayload = {
      sid: process.env.RINGY_SID,
      authToken: process.env.RINGY_AUTH_TOKEN,
      phone_number,
      full_name,
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
      body: JSON.stringify(ringyPayload)
    });

    const data = await ringyRes.json();

    if (!ringyRes.ok) {
      console.error("❌ Ringy Error:", data);
      return res.status(ringyRes.status).json({ message: "Error sending to Ringy", error: data });
    }

    console.log("✅ Ringy response:", data);
    return res.status(200).json({ success: true, vendorResponseId: data.vendorResponseId });
  } catch (err) {
    console.error("❌ Server Error:", err.message);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}
