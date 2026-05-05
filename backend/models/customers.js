const mongoose = require('mongoose');

// 1. Define the Booking Sub-Schema first
// This allows each individual booking in the array to have its own virtual lookup
const BookingSchema = new mongoose.Schema({
    match: { 
        type: Number,  
        required: true 
    },
    ticket_category: { type: String, required: true },
    quantity: { type: Number, required: true },
    individual_tickets: [String]
    
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// 2. Define the Virtual ON THE BOOKING SCHEMA
// This is the "bridge" that connects EACH booking to the 'Tickets' collection
BookingSchema.virtual('match_data', {
    ref: 'Tickets',            // The model name for your matches
    localField: 'match',       // The number (5, 7, 3) in this specific booking
    foreignField: 'match',     // The 'match' field in the Tickets collection
    justOne: true              // Link to exactly one match document
});

// 3. Define the Main Customer Schema
const CustomerSchema = new mongoose.Schema({
    customer_first_name: { type: String, required: true },
    customer_last_name: { type: String },
    email: { type: String, required: true },
    phonenumber: { type: String, minLength: 11, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    
    booking_id: { type: String },
    total_amount: { type: Number },
    total_tickets: { type: Number },

    wallet_address: { type: String },
    transaction_hash: { type: String },
    ipfs_hash: { type: String },

    BookingTime: { type: Date, default: Date.now },
    status: { type: String, default: "pending" },

    // Use the BookingSchema here instead of a generic object
    bookings: [BookingSchema], 

}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

module.exports = mongoose.model('Customers', CustomerSchema);