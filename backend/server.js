require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

const ticketRoutes = require('./routes/tickets');
const customerRoutes = require('./routes/customers');


const corsOptions = {
    origin: [
        "https://cricket-vault-dapp.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true 
};

app.use(cors(corsOptions));


app.use(express.json());

// console.log("My DB URL is: ", process.env.TICKET_BOOKING_DB_URI);

const connectDB = async () => {
  try {
    // This is the variable you have in Vercel
    await mongoose.connect(process.env.TICKET_Booking_DB_URI, {
      serverSelectionTimeoutMS: 5000, // Stop waiting after 5 seconds
    });
    console.log("MongoDB Connected for Cricket Vault...");
  } catch (err) {
    console.error("Connection failed, retrying in 2 seconds...", err);
    setTimeout(connectDB, 2000);
  }
};

connectDB();


// mongoose.connect(process.env.TICKET_BOOKING_DB_URI)
//   .then(() => console.log('Successfully connected to Ticket Booking Database'))
//   .catch(err => console.error('Database connection error:', err));


app.get("/", (req, res) => {
    res.send("Backend is working! API is ready.");
});

app.use("/api",ticketRoutes)
app.use("/api",customerRoutes)


module.exports = app;

// app.listen(3000, () => {
//     console.log('Server running on http://localhost:3000');
// });