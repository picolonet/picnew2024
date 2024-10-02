const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all route to serve index.html for any unmatched routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
// Parse JSON bodies for API requests
app.use(express.json());

// Function to save contact data to a JSON file
function saveContactToFile(contactData) {
  const fs = require('fs');
  const path = require('path');
  const filePath = path.join(__dirname, 'web_contacts.json');

  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      let contacts = [];
      if (!err && data) {
        try {
          contacts = JSON.parse(data);
        } catch (parseError) {
          console.error('Error parsing existing data:', parseError);
        }
      }

      contacts.push(contactData);

      fs.writeFile(filePath, JSON.stringify(contacts, null, 2), (writeErr) => {
        if (writeErr) {
          console.error('Error writing to file:', writeErr);
          reject(writeErr);
        } else {
          resolve();
        }
      });
    });
  });
}

// Handle POST request to /api/contact
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  
  const contactData = {
    name,
    email,
    message,
    timestamp: new Date().toISOString()
  };

  saveContactToFile(contactData)
    .then(() => {
      res.json({ success: true, message: 'Message received and saved successfully' });
    })
    .catch((error) => {
      res.status(500).json({ success: false, message: 'Error saving message' });
    });
});
