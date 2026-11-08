const express = require('express');
const cors = require('cors');
const path = require('path');

require('dotenv').config({
  path: path.join(__dirname, '../.env')
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'PLMun Health Portal API is running!' });
});

app.listen(PORT, () => {
  console.log(`PLMun Health Portal running at http://localhost:${PORT}`);
});
