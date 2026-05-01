const express = require("express");
const Customer = require('../models/customers');
const router = express.Router();
const ethers = require("ethers");
const contractAbi = require('../abi.json');

// CRITICAL: The string must exactly match the Solidity signature to produce the correct hash.
// No spaces between types in the signature hash calculation.

// const CRICKET_VAULT_ABI = [
//     "event Deposit(string ticketId, address indexed user, uint256 amount)"
// ];

router.post("/webhook", async (req, res) => {
    try {
        const logs = req.body.event?.data?.block?.logs;

        // 1. Handle empty logs (Alchemy test pings)
        if (!logs || logs.length === 0) {
            console.log("No logs found. This might be a test ping.");
            return res.status(200).json({ status: "ignored" });
        }

        // const iface = new ethers.Interface([
        //     "event Deposit(string ticketId, address indexed user, uint256 amount)"
        // ]);

        // const iface = new ethers.Interface([
        //     "event Deposit(string ticketId,address indexed user,uint256 amount)"
        // ]);

        // const iface = new ethers.Interface([
        //     "event Deposit(string,address,uint256)"
        // ]);

        const iface = new ethers.Interface(contractAbi);

        console.log("Topic0:", ethers.id("Deposit(string,address,uint256)"));

        const transactionHash = logs[0].transaction?.hash;

        let decoded = null;

        try {
            decoded = iface.parseLog(logs[0]);
        } catch (parseError) {
            console.log("DECODE FAILED. The ABI does not match the transaction log.");
            console.log("Log Topics:", logs[0].topics);
            console.log("Log Data:", logs[0].data);
            return res.status(200).json({ status: "error", message: "ABI Mismatch" });
        }

        // if (!decoded) {
        //     return res.status(200).json({ status: "error", message: `Logs: ${logs}` });
        // }

        if (!decoded) {
            const expected = iface.getEvent("Deposit").topicHash;
            const received = logs[0].topics[0];
    
            return res.status(200).json({ 
                status: "error", 
                message: "Decoded as null",
                comparison: {
                    expected: expected,
                    received: received,
                    match: expected.toLowerCase() === received.toLowerCase()
                }
            });
        }

        // 3. Extract data from the decoded object
        // Since 'ticketId' is the first unindexed parameter, it's available here:
        const ticketId = decoded.args.ticketId; 

        console.log(`Processing payment for Ticket ID: ${ticketId}`);

        // 4. Update MongoDB
        const updatedBooking = await Customer.findOneAndUpdate(
            { ticket_id: ticketId }, // Matches the string we just decoded
            { 
                status: "paid", 
                transactionHash: transactionHash,
            },
            { returnDocument: 'after' }
        );

        if (!updatedBooking) {
            console.log("Ticket ID not found in database:", ticketId);
            return res.status(200).json({ 
                status: "error", 
                message: "Ticket ID not found in database", 
                ticketId 
            });
        }

        console.log("Verified Booking Updated to Paid:", ticketId);
        return res.status(200).json({ 
            status: "success", 
            message: "Booking updated", 
            ticketId 
        });

    } catch (error) {
        console.error("Webhook Logic Error:", error.message);
        // We still return 200 to Alchemy to prevent them from retrying 
        // a broken logic loop, but we log the error.
        return res.status(200).json({ status: "internal_error", error: error.message });
    }
});

module.exports = router;