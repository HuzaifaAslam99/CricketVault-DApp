require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

const ticketRoutes = require('./routes/tickets');
const customerRoutes = require('./routes/cutomers');


app.use(cors());


app.use(express.json());

// console.log("My DB URL is: ", process.env.TICKET_BOOKING_DB_URI);

mongoose.connect(process.env.TICKET_BOOKING_DB_URI)
  .then(() => console.log('Successfully connected to Ticket Booking Database'))
  .catch(err => console.error('Database connection error:', err));


app.get("/", (req, res) => {
    res.send("Backend is working! API is ready.");
});

app.use("/api",ticketRoutes)
app.use("/api",customerRoutes)



app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});