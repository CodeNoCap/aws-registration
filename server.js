// server.js

const express = require('express'); // Ensure Express is installed and required
const bodyParser = require('body-parser'); // Middleware to parse incoming request bodies
const { google } = require('googleapis');
const cors = require('cors');
const { GoogleAuth } = require('google-auth-library');

const app = express();
const port = 3000;

app.use(bodyParser.json()); // To handle JSON request bodies
app.use(cors());

const auth = new GoogleAuth({
    keyFile: './credentials.json', // path to the JSON file
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

app.post('/api/submit', async (req, res) => {
    const { name, idNumber } = req.body;

    if (!name || !idNumber) {
        return res.status(400).json({ message: 'Name and ID number are required.' });
    }

    try {
        const client = await auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: client });
        const spreadsheetId = '1NF2lqfCIL1jnbdDyi_4TUzQ8k23XZkkAOaq7rJ3tp9I'; // Your spreadsheet ID
        const range = 'Registration!A:B'; // Adjust to the correct sheet and columns

        const request = {
            spreadsheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            resource: {
                values: [[name, idNumber]] // Use the received name and ID number
            },
        };

        const response = await sheets.spreadsheets.values.append(request);
        console.log('Data appended successfully:', response.data);

        return res.status(200).json({ message: 'Data successfully submitted to Google Sheets.' });
    } catch (err) {
        console.error('Error appending data:', err);
        return res.status(500).json({ message: 'Failed to submit data.' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
