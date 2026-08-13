const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function setSecurityHeaders(res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'"
  );
}

function renderPage({
  title,
  message,
  token = null,
  showButton = false,
}) {
  const form = showButton
    ? `
      <form method="POST" action="/unsubscribe?token=${token}">
        <button type="submit">Unsubscribe</button>
      </form>
    `
    : '';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title} | Highmark Agency</title>
  <style>
    body {
      margin: 0;
      background: #f5f7fa;
      color: #1f2937;
      font-family: Arial, Helvetica, sans-serif;
    }

    main {
      width: calc(100% - 40px);
      max-width: 560px;
      margin: 80px auto;
      padding: 36px;
      box-sizing: border-box;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06);
    }

    h1 {
      margin: 0 0 16px;
      font-size: 28px;
    }

    p {
      margin: 0 0 24px;
      font-size: 16px;
      line-height: 1.6;
    }

    button {
      border: 0;
      border-radius: 6px;
      padding: 13px 20px;
      background: #17324d;
      color: #ffffff;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
    }

    footer {
      margin-top: 30px;
      color: #6b7280;
      font-size: 12px;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <main>
    <h1>${title}</h1>
    <p>${message}</p>

    ${form}

    <footer>
      Highmark Agency<br>
      712 E Elgin St, Gilbert, AZ 85295
    </footer>
  </main>
</body>
</html>`;
}

export default async function handler(req, res) {
  setSecurityHeaders(res);

  if (!['GET', 'POST'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST');

    return res.status(405).send(
      renderPage({
        title: 'Request not supported',
        message: 'Please use the unsubscribe link from the email.',
      })
    );
  }

  const rawToken = Array.isArray(req.query.token)
    ? req.query.token[0]
    : req.query.token;

  const token = String(rawToken || '').trim();

  if (!UUID_PATTERN.test(token)) {
    return res.status(200).send(
      renderPage({
        title: 'Link unavailable',
        message:
          'This unsubscribe link is invalid or incomplete. You may also reply to the original email and request removal.',
      })
    );
  }

  // GET only displays confirmation. It never changes subscription status.
  if (req.method === 'GET') {
    return res.status(200).send(
      renderPage({
        title: 'Unsubscribe from Highmark Agency?',
        message:
          'Confirm below to stop receiving future commercial email from Highmark Agency.',
        token,
        showButton: true,
      })
    );
  }

  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, '');
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing required Supabase server environment variables');

    return res.status(500).send(
      renderPage({
        title: 'Unable to process request',
        message:
          'We could not process your request right now. Please try again later or reply to the original email.',
      })
    );
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/rpc/process_unsubscribe`,
      {
        method: 'POST',
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          p_token: token,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        'Supabase unsubscribe RPC failed:',
        response.status,
        errorText.slice(0, 500)
      );

      return res.status(500).send(
        renderPage({
          title: 'Unable to process request',
          message:
            'We could not process your request right now. Please try again later or reply to the original email.',
        })
      );
    }

    const result = await response.json();
    const outcome = Array.isArray(result) ? result[0] : result;

    if (!outcome?.success) {
      return res.status(200).send(
        renderPage({
          title: 'Link unavailable',
          message:
            'This unsubscribe link is invalid or no longer available. You may also reply to the original email and request removal.',
        })
      );
    }

    return res.status(200).send(
      renderPage({
        title: 'You have been unsubscribed',
        message:
          'Your address has been removed from future Highmark Agency commercial email.',
      })
    );
  } catch (error) {
    console.error('Unexpected unsubscribe error:', error);

    return res.status(500).send(
      renderPage({
        title: 'Unable to process request',
        message:
          'We could not process your request right now. Please try again later or reply to the original email.',
      })
    );
  }
}

