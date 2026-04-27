const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({

    team1: { type: String},
    team2: { type: String},
    img_team1: { type: String},
    img_team2: { type: String},
  
    match: {type: Number},
    venue: { type: String},
    city: {type: String},
    date: {type: String},

    general_price: {type: Number},
    standard_price: {type: Number},
    firstClass_price: {type: Number},
    VIP_price: {type: Number},

    total_seats: {type: Number},
    total_general_seats: {type: Number},
    total_standard_seats: {type: Number},
    total_firstClass_seats: {type: Number},
    total_VIP_seats: {type: Number}

});

module.exports = mongoose.model('Tickets', TicketSchema);
