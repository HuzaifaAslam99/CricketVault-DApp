const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({

    customer_first_name: { type: String, required: true },
    customer_last_name: { type: String },

    email: { type: String, required: true},
    phonenumber: {type:String, minLength:11, required: true},

    city: {type: String, required: true},
    address: {type: String, required: true},
    
    ticket_id: {type: String},
    
    total_amount : {type: Number},
    total_tickets: {type: Number},

    wallet_address : {type: String},
    transaction_hash: {type: String},
    ipfs_hash: {type: String},

    BookingTime: {  type: Date, default: Date.now },
    status: { type: String,  default: "pending" },
    // match_id: {type: Number},

    bookings: [{
        match: { 
            type: Number,  
            required: true 
        },
        ticket_category: { type: String, required: true },
        quantity: { type: Number, required: true },
    }],

},

{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
}
);

    CustomerSchema.virtual('match_details', {
        ref: 'Tickets',            // The model you are joining with
        localField: 'bookings.match', // The field in THIS schema (the number 6)
        foreignField: 'match',      // The field in the Tickets schema (also number 6)
        justOne: true              // Each booking links to one match
    });


module.exports = mongoose.model('Customers', CustomerSchema);
