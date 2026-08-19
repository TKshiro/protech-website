const { google } = require('googleapis');
const crypto = require('crypto');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const spreadsheetId = process.env.SPREADSHEET_ID;
  const adminPassword = process.env.ADMIN_PASSWORD || 'protechadmin123';
  const googleCredsEnv = process.env.GOOGLE_SERVICE_ACCOUNT;

  // Find Google credentials
  let credentials;
  if (googleCredsEnv) {
    try {
      credentials = JSON.parse(googleCredsEnv);
    } catch (err) {
      console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT environment variable:', err);
    }
  }

  if (!credentials) {
    // Local development fallback
    const fs = require('fs');
    const path = require('path');
    const localKeyPath = path.resolve(process.cwd(), 'google-service-account.json');
    if (fs.existsSync(localKeyPath)) {
      try {
        credentials = JSON.parse(fs.readFileSync(localKeyPath, 'utf8'));
      } catch (err) {
        console.error('Failed to read local google-service-account.json:', err);
      }
    }
  }

  if (!credentials) {
    return res.status(500).json({
      error: 'Google Service Account credentials missing. Please set GOOGLE_SERVICE_ACCOUNT environment variable or place google-service-account.json in root.'
    });
  }

  if (!spreadsheetId) {
    return res.status(500).json({
      error: 'SPREADSHEET_ID environment variable is missing.'
    });
  }

  // 1. Password authentication for administrative routes (GET and PATCH)
  if (req.method === 'GET' || req.method === 'PATCH') {
    const authHeader = req.headers.authorization || '';
    const match = authHeader.match(/^Bearer (.+)$/i);
    if (!match) {
      return res.status(401).json({ error: 'Unauthorized: Missing token' });
    }
    const clientHash = match[1];
    const expectedHash = crypto.createHash('sha256').update(adminPassword).digest('hex');
    if (clientHash !== expectedHash) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const range = 'Sheet1!A:L'; // Columns: id, date, inquiry_type, name, company, email, phone, budget, referral_source, message, status, travel

  try {
    // 2. POST Handler: Append a new inquiry
    if (req.method === 'POST') {
      const { id, date, inquiry_type, name, company, email, phone, budget, referral_source, message, status, travel } = req.body;

      // Check if Sheet1 exists and is blank. If so, write headers first.
      let currentRows;
      try {
        const checkRes = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: 'Sheet1!A1:A1',
        });
        currentRows = checkRes.data.values;
      } catch (err) {
        console.warn('Could not read Sheet1 A1 (might be empty/not exist):', err.message);
      }

      if (!currentRows || currentRows.length === 0) {
        // Initialize Sheet1 with headers
        const headers = ['id', 'date', 'inquiry_type', 'name', 'company', 'email', 'phone', 'budget', 'referral_source', 'message', 'status', 'travel'];
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: 'Sheet1!A1:L1',
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [headers] },
        });
      }

      const travelStr = travel ? JSON.stringify(travel) : '';
      const values = [
        [
          id || '',
          date || new Date().toISOString(),
          inquiry_type || '',
          name || '',
          company || '',
          email || '',
          phone || '',
          budget || '',
          referral_source || '',
          message || '',
          status || '未対応',
          travelStr,
        ],
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values },
      });

      return res.status(200).json({ success: true });
    }

    // 3. GET Handler: Retrieve all inquiries
    if (req.method === 'GET') {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      const rows = response.data.values || [];
      if (rows.length <= 1) {
        return res.status(200).json([]);
      }

      const headers = rows[0];
      const dataRows = rows.slice(1);

      const contacts = dataRows.map((row) => {
        const item = {};
        headers.forEach((header, index) => {
          let val = row[index] || '';
          if (header === 'travel') {
            try {
              val = val ? JSON.parse(val) : {};
            } catch (_) {}
          }
          item[header] = val;
        });
        return item;
      });

      return res.status(200).json(contacts);
    }

    // 4. PATCH Handler: Update the status of a specific inquiry by ID
    if (req.method === 'PATCH') {
      const { id, status } = req.body;
      if (!id || !status) {
        return res.status(400).json({ error: 'Missing parameters: id and status are required.' });
      }

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      const rows = response.data.values || [];
      const rowIndex = rows.findIndex((row) => row[0] === id);

      if (rowIndex === -1) {
        return res.status(404).json({ error: 'Inquiry not found.' });
      }

      // K corresponds to the 11th column (status)
      const cellRange = `Sheet1!K${rowIndex + 1}`;
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: cellRange,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[status]],
        },
      });

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed.' });
  } catch (err) {
    console.error('API execution failed:', err);
    return res.status(500).json({ error: err.message });
  }
};
