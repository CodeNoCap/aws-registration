const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const cors = require('cors');
const { GoogleAuth } = require('google-auth-library');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const auth = new GoogleAuth({
    keyFile: './credentials.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
});


app.post('/api/submit', async (req, res) => {
    const { refID, name, idNumber, courseSection } = req.body;

    if (!name || !idNumber || !courseSection) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const client = await auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: client });
        const spreadsheetId = '1NF2lqfCIL1jnbdDyi_4TUzQ8k23XZkkAOaq7rJ3tp9I';
        const range = 'Registration!A:D'; // Columns A: Reference ID, B: Name, C: ID, D: Course-Year-Section

        const request = {
            spreadsheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            resource: {
                values: [[refID, name, idNumber, courseSection]],
            },
        };

        const response = await sheets.spreadsheets.values.append(request);
        return res.status(200).json({ message: 'Data successfully submitted to Google Sheets.' });

    } catch (err) {
        console.error('Error in Google Sheets API:', err.message);
        return res.status(500).json({ message: 'Failed to submit data.', error: err.message });
    }
});

app.get('/api/get-last-refid', async (req, res) => {
    try {
        const client = await auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: client });
        const spreadsheetId = '1NF2lqfCIL1jnbdDyi_4TUzQ8k23XZkkAOaq7rJ3tp9I';

        // Fetch the last refID
        const lastRefIdResponse = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Registration!A:A' // Get all values in column A (Reference ID)
        });

        const lastRefIdValues = lastRefIdResponse.data.values;

        // Get the last value in column A (the last refID)
        const lastRefId = lastRefIdValues && lastRefIdValues.length > 0 ? parseInt(lastRefIdValues[lastRefIdValues.length - 1][0]) : 0;

        return res.status(200).json({ lastRefID: lastRefId });

    } catch (err) {
        console.error('Error in Google Sheets API:', err.message);
        return res.status(500).json({ message: 'Failed to retrieve last refID.', error: err.message });
    }
});


app.listen(10000, () => {
    console.log('Server running on port 10000');
});
