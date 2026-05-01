const express = require("express");
const Customer = require('../models/customers');
const router = express.Router();
const ethers = require("ethers");

// CRITICAL: The string must exactly match the Solidity signature to produce the correct hash.
// No spaces between types in the signature hash calculation.
const CRICKET_VAULT_ABI = [
    "event Deposit(string ticketId, address indexed user, uint256 amount)"
];

router.post("/webhook", async (req, res) => {
    try {
        const logs = req.body.event?.data?.block?.logs;

        // 1. Handle empty logs (Alchemy test pings)
        if (!logs || logs.length === 0) {
            console.log("No logs found. This might be a test ping.");
            return res.status(200).json({ status: "ignored" });
        }

        const iface = new ethers.Interface(CRICKET_VAULT_ABI);
        const transactionHash = logs[0].transaction?.hash;
        
        // 2. Normalize and Decode
        let decoded = null;
        try {
            // We lowercase topics to ensure the 'match: false' error from your 
            // screenshot (image_4c8a17.png) is bypassed.
            decoded = iface.parseLog({
                topics: logs[0].topics.map(t => t.toLowerCase()),
                data: logs[0].data
            });
        } catch (parseError) {
            console.error("DECODE FAILED:", parseError.reason);
            return res.status(200).json({ 
                status: "error", 
                message: "ABI Mismatch or Malformed Data",
                debug: {
                    expectedTopic0: iface.getEvent("Deposit").topicHash,
                    receivedTopic0: logs[0].topics[0]
                }
            });
        }

        if (!decoded) {
            return res.status(200).json({ status: "error", message: "Decoded as null" });
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