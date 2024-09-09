const { google } = require('googleapis');

async function getSheetData() {
    const auth = new google.auth.GoogleAuth({
        keyFile: './credentials.json',
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const spreadsheetId = '1NF2lqfCIL1jnbdDyi_4TUzQ8k23XZkkAOaq7rJ3tp9I';
    const range = 'Registration!A:B';

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });
        console.log(response.data);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

getSheetData();
