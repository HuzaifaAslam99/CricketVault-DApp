require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

const ticketRoutes = require('./routes/tickets');
const customerRoutes = require('./routes/customers');
// const webhookRoutes = require('./routes/webhook');


const corsOptions = {
    origin: [
        "https://cricket-vault-dapp.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true 
};

// Reverting to clean state

app.use(cors(corsOptions));


app.use(express.json());

// console.log("My DB URL is: ", process.env.TICKET_BOOKING_DB_URI);


let isConnected = false;

const connectDB = async () => {
    if (isConnected) return;

    try {
        // DOUBLE CHECK THE CASING: Must match exactly what is in Vercel Settings
        const db = await mongoose.connect(process.env.Ticket_Booking_DB_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        isConnected = db.connections[0].readyState;
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('DB Connection Error:', err.message);
        // Important: throw the error so the function fails instead of hanging
        throw err;
    }
};

// 2. MIDDLEWARE TO ENSURE DB IS READY
// This prevents the "500" crash when routes try to use a closed connection
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        res.status(500).json({ error: "Database connection failed" });
    }
});



// mongoose.connect(process.env.Ticket_Booking_DB_URI)
//   .then(() => console.log('Successfully connected to Ticket Booking Database'))
//   .catch(err => console.error('Database connection error:', err));


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