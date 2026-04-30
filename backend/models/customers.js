const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({

    customer_first_name: { type: String, required: true },
    customer_last_name: { type: String },

    email: { type: String, required: true, unique: true },
    phonenumber: {type:String, minLength:11, required: true},

    city: {type: String, required: true},
    address: {type: String, required: true},
    
    ticket_id: {type: String},
    
    ticket_category : {type: String},
    total_amount : {type: Number},
    total_tickets: {type: Number},

    wallet_address : {type: String},
    transaction_hash: {type: String},
    ipfs_hash: {type: String},

    BookingTime: {  type: Date, default: Date.now },

    status: { type: String,  default: "pending" },

});


module.exports = mongoose.model('Customers', CustomerSchema);
