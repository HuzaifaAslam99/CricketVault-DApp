const Customer = require('../models/customers');
const crypto = require("crypto")
const express = require("express")
const router = express.Router()

// const { PinataSDK } = require("pinata-web3");
// const pinata = new PinataSDK({ pinataJwt: process.env.PINATA_JWT });

router.post("/customersBooking/initiate", async (req, res) => {
    try {

        const ticketId = crypto.randomBytes(4).toString("hex");

        const newCustomer = new Customer({
            customer_first_name: req.body.firstName,
            customer_last_name: req.body.lastName,
            email: req.body.email,
            phonenumber: req.body.phone,
            city: req.body.city,
            address: req.body.address,
            total_tickets: req.body.quantity,
            ticket_category : req.body.category,
            total_amount : req.body.amount,
            wallet_address : req.body.wallet_address,
            // transaction_hash: req.body.transaction_hash,
            ticket_id: ticketId,
            ipfs_hash: "ipfs hash"
        });

        const savedCustomer = await newCustomer.save();

        res.status(201).json(savedCustomer);
        
    } catch (err) {
        console.error("Error saving customer:", err);
        res.status(400).json({ 
            message: "Cannot Post Data", 
            error: err.message 
        });
    }
});





router.get("/bookingVerify/:ticketId", async (req, res) => {
    try {
        const { ticketId } = req.params;

        const findCustomer = await Customer.findOne({ticket_id: ticketId});
        res.status(200).json(findCustomer);

    } catch (err) {
        console.error("Booking Access Error:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
});



module.exports = router