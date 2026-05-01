const express = require("express");
const Customer = require('../models/customers');
const router = express.Router();
const ethers = require("ethers");
const contractAbi = require('../abi.json');

router.post("/webhook", async (req, res) => {
    try {
        // 1. Extract logs with fallback for different Alchemy payload structures
        const logs = req.body.event?.data?.block?.logs || req.body.event?.data?.logs || [];

        if (logs.length === 0) {
            console.log("No logs found. This might be a test ping or empty block.");
            return res.status(200).json({ status: "ignored" });
        }

        const iface = new ethers.Interface(contractAbi);

        // 2. Constants for filtering
        // The specific Topic0 hash produced by your contract on the blockchain
        const ACTUAL_DEPOSIT_HASH = "0xd327b35e36b3981157588978d60961ff5c09dc2926008abb1dd77b1197a416ed".toLowerCase();
        
        // Security: Your verified contract address
        const VAULT_ADDRESS = "0x7Ce5D05474fabA0Cf8910Bd25B2eDe407F11Fc4c".toLowerCase();

        // 3. Find the specific log that matches your contract and the Deposit event
        const depositLog = logs.find(log => 
            log?.address?.toLowerCase() === VAULT_ADDRESS && 
            log?.topics?.[0]?.toLowerCase() === ACTUAL_DEPOSIT_HASH
        );

        if (!depositLog) {
            console.log("Authentic Deposit log not found in this payload.");
            return res.status(200).json({ 
                status: "error", 
                message: "Authentic Deposit log not found" 
            });
        }

        // 4. Extract transaction metadata
        const transactionHash = depositLog.transaction?.hash || "unknown_hash";

        let decoded = null;
        try {
            // Attempt to parse using the provided ABI
            decoded = iface.parseLog({
                topics: depositLog.topics,
                data: depositLog.data
            });
        } catch (parseError) {
            console.log("Standard parse failed, attempting manual decode fallback...");
            
            // 5. Fallback: Manual decode if the ABI hash is still causing mismatches
            const abiCoder = new ethers.AbiCoder();
            
            // Based on Deposit(string ticketId, address indexed user, uint256 amount)
            // Unindexed data contains: [string, uint256]
            const decodedData = abiCoder.decode(["string", "uint256"], depositLog.data);
            
            decoded = {
                args: {
                    ticketId: decodedData[0],
                    amount: decodedData[1],
                    // Extract user from topics[1] (indexed parameters are in topics)
                    user: ethers.getAddress(ethers.dataSlice(depositLog.topics[1], 12))
                }
            };
        }

        const ticketId = decoded.args.ticketId; 
        console.log(`Processing payment for Ticket ID: ${ticketId}`);

        // 6. Update MongoDB
        const updatedBooking = await Customer.findOneAndUpdate(
            { ticket_id: ticketId }, 
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
        // Return 200 to acknowledge receipt and prevent Alchemy retries on logic errors
        return res.status(200).json({ status: "internal_error", error: error.message });
    }
});

module.exports = router;



        // const iface = new ethers.Interface([
        //     "event Deposit(string ticketId, address indexed user, uint256 amount)"
        // ]);