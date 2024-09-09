const axios = require('axios');

async function testApiKey() {
  try {
    const response = await axios.get(
      'https://sheets.googleapis.com/v4/spreadsheets/YOUR_SPREADSHEET_ID/values/A:A?key=YOUR_API_KEY'
    );
    console.log('API call successful:', response.data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testApiKey();