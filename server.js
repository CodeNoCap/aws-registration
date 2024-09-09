const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const cors = require('cors');
const { GoogleAuth } = require('google-auth-library');

const app = express();

// CORS options to allow specific headers
const corsOptions = {
    origin: '*', // Allow all origins or specify your frontend URL (e.g., 'http://127.0.0.1:5500')
    methods: ['GET', 'POST', 'OPTIONS'], // Allow these HTTP methods
    allowedHeaders: ['Content-Type'], // Allow the 'Content-Type' header
};

// Use the updated CORS configuration
app.use(cors(corsOptions));

app.use(bodyParser.json()); // Parse JSON request bodies

const auth = new GoogleAuth({
    keyFile: './credentials.json', // Path to the JSON file
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

// Handle POST requests
app.post('/api/submit', async (req, res) => {
    const { name, idNumber } = req.body;

    if (!name || !idNumber) {
        return res.status(400).json({ message: 'Name and ID number are required.' });
    }

    try {
        const client = await auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: client });
        console.log('Authentication successful');
        const spreadsheetId = '1NF2lqfCIL1jnbdDyi_4TUzQ8k23XZkkAOaq7rJ3tp9I'; // Your spreadsheet ID
        const range = 'Registration!A:B';

        const request = {
            spreadsheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            resource: {
                values: [[name, idNumber]],
            },
        };

        const response = await sheets.spreadsheets.values.append(request);
        console.log('Data appended successfully:', response.data);
        return res.status(200).json({ message: 'Data successfully submitted to Google Sheets.' });

    } catch (err) {
        console.error('Error in Google Sheets API:', err.message); // Log more details
        return res.status(500).json({ message: 'Failed to submit data.', error: err.message });
    }
});


// Handle preflight OPTIONS requests
app.options('/api/submit', cors(corsOptions)); // Enable preflight requests for this route

// Start the server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
});
