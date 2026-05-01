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


        const iface = new ethers.Interface(contractAbi);

// 1. Hardcode the CORRECT hash that the blockchain is actually sending
const ACTUAL_DEPOSIT_HASH = "0xd327b35e36b3981157588978d60961ff5c09dc2926008abb1dd77b1197a416ed";

// 2. SECURITY: Hardcode your contract address to prevent spoofing
const VAULT_ADDRESS = "0x7Ce5D05474fabA0Cf8910Bd25B2eDe407F11Fc4c".toLowerCase();

// 3. Find the specific log that matches both your address and the correct hash
const depositLog = logs.find(log => 
    log.address.toLowerCase() === VAULT_ADDRESS && 
    log.topics[0].toLowerCase() === ACTUAL_DEPOSIT_HASH.toLowerCase()
);

if (!depositLog) {
    return res.status(200).json({ 
        status: "error", 
        message: "Authentic Deposit log not found in this block" 
    });
}

let decoded = null;
try {
    // 4. Use parseLog on the found log
    decoded = iface.parseLog({
        topics: depositLog.topics,
        data: depositLog.data
    });
} catch (parseError) {
    // If parseLog still returns null/errors, we fall back to manual decoding
    const abiCoder = new ethers.AbiCoder();
    const decodedData = abiCoder.decode(["string", "uint256"], depositLog.data);
    
    decoded = {
        args: {
            ticketId: decodedData[0],
            amount: decodedData[1],
            user: ethers.getAddress(ethers.dataSlice(depositLog.topics[1], 12)) // Extract indexed address
        }
    };
}

// Proceed with your MongoDB update using decoded.args.ticketId

 

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
        //

    } catch (error) {
        console.error("Webhook Logic Error:", error.message);
        // We still return 200 to Alchemy to prevent them from retrying 
        // a broken logic loop, but we log the error.
        return res.status(200).json({ status: "internal_error", error: error.message });
    }
});

module.exports = router;