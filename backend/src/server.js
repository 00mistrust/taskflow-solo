const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// This lets Express read JSON from requests
app.use(express.json());

// Test route — just to confirm the server works
app.get('/', (req, res) => {
  res.json({ message: 'TaskFlow API is running!' });
});

// Connect to MongoDB then start the server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
  });
