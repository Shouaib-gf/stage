const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');

const dotenv = require('dotenv');
const { logEvent } = require('./safeLogger');
dotenv.config(); // Charge les variables d'environnement
const app = express();
app.use(cors());
app.use(express.json());
const connectDB = async () => {
   mongoose.set("strictQuery", false);
   mongoose.connect(process.env.MONGO_URI, {
     useNewUrlParser: true,
     useUnifiedTopology: true,
   })
   .then(() => {
     logEvent('info', 'mongodb_connected');
   
     // Listen on port 80 for HTTP server
    const PORT = process.env.PORT || 80;
    app.listen(PORT, () => {
      logEvent('info', 'http_server_started');
     });
   
    
   })
   .catch(() => {
     logEvent('error', 'mongodb_connection_failed');
   });
};

module.exports = connectDB;
