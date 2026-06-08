require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

const ticketRoutes = require('./routes/tickets');
const customerRoutes = require('./routes/customers');
const webhookRoutes = require('./routes/webhook');


const corsOptions = {
    origin: [
        "https://cricket-vault-dapp.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true 
};

app.use(cors(corsOptions));



// TEMPORARY ROUTE FOR LOAD.IO VERIFICATION (Delete after verifying!)

// app.get('/loaderio-070909ea141525027451409c1624b0d8.txt', (req, res) => {
//   res.send('loaderio-070909ea141525027451409c1624b0d8');
// });



app.use(express.json({
  verify: (req, res, buf) => {
    // Only capture for the webhook to save memory on other routes
    if (req.originalUrl === '/api/webhook') {
      req.rawBody = buf; // Keep it as a BINARY Buffer
    }
  }
}));



let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  await mongoose.connect(process.env.Ticket_Booking_DB_URI);
  isConnected = true;
  console.log('MongoDB Connected');
};

app.use(async (req, res, next) => {
  await connectDB();
  next();
});


app.get("/", (req, res) => {
    res.send("Backend is working! API is ready.");
});

app.use("/api",ticketRoutes)
app.use("/api",customerRoutes)
app.use("/api", webhookRoutes)


module.exports = app;

// app.listen(3000, () => {
//     console.log('Server running on http://localhost:3000');
// });