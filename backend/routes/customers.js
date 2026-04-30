const Customer = require('../models/customers');
const crypto = require("crypto")
const express = require("express")
const router = express.Router()

// const { PinataSDK } = require("pinata-web3");
// const pinata = new PinataSDK({ pinataJwt: process.env.PINATA_JWT });

router.post("/customers", async (req, res) => {
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
            transaction_hash: req.body.transaction_hash,
            ticket_id: ticketId
        });

        // const ipfsMetadata = {
        //     wallet_address : req.body.wallet_address,
        //     ticket_id: ticketId,
        //     total_tickets: req.body.quantity,
        //     ticket_category : req.body.category,
        //     total_amount : req.body.amount,
        //     timestamp: new Date().toISOString()
        // };

        // 2. Upload to Pinata

        // const upload = await pinata.upload.json(ipfsMetadata);

        // const cid = upload.IpfsHash;

        // if (!cid) {
        //     throw new Error("Pinata did not return an IpfsHash.");
        // }

        // newCustomer.ipfsHash = cid;

        const savedCustomer = await newCustomer.save();

        res.status(201).json({
            message: "Booking successful!",
            data: savedCustomer
        });
        
    } catch (err) {
        console.error("Error saving customer:", err);
        res.status(400).json({ 
            message: "Cannot Post Data", 
            error: err.message 
        });
    }
});



module.exports = router