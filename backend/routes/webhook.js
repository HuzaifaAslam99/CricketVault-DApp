const express = require("express");
const Customer = require('../models/customers');
const router = express.Router();
const ethers = require("ethers");
const contractAbi = require('../abi.json');

router.post("/webhook", async (req, res) => {
    try {
        const logs = req.body.event?.data?.block?.logs;

        // 1. Handle empty logs (Alchemy test pings)
        if (!logs || logs.length === 0) {
            return res.status(200).json({ status: "ignored" });
        }

        const iface = new ethers.Interface(contractAbi);

        // CORRECT hash from the blockchain
        const ACTUAL_DEPOSIT_HASH = "0xd327b35e36b3981157588978d60961ff5c09dc2926008abb1dd77b1197a416ed";

        // SECURITY: Hardcode your contract address
        const VAULT_ADDRESS = "0x7Ce5D05474fabA0Cf8910Bd25B2eDe407F11Fc4c".toLowerCase();

        // 2. Find the specific log
        const depositLog = logs.find(log => 
            log?.address?.toLowerCase() === VAULT_ADDRESS && 
            log?.topics?.[0]?.toLowerCase() === ACTUAL_DEPOSIT_HASH.toLowerCase()
        );

        if (!depositLog) {
            console.log("Log match not found. Logs received:", JSON.stringify(logs));
            return res.status(200).json({ 
                status: "error", 
                message: "Authentic Deposit log not found in this block" 
            });
        }

        // Define transactionHash from the found log
        const transactionHash = depositLog.transaction?.hash;

        let decoded = null;
        try {
            // 3. Attempt standard decode
            decoded = iface.parseLog({
                topics: depositLog.topics,
                data: depositLog.data
            });
        } catch (parseError) {
            // 4. Fallback manual decode if ABI hash still mismatches
            const abiCoder = new ethers.AbiCoder();
            const decodedData = abiCoder.decode(["string", "uint256"], depositLog.data);
            
            decoded = {
                args: {
                    ticketId: decodedData[0],
                    amount: decodedData[1],
                    user: ethers.getAddress(ethers.dataSlice(depositLog.topics[1], 12))
                }
            };
        }

        const ticketId = decoded.args.ticketId; 
        console.log(`Processing payment for Ticket ID: ${ticketId}`);

        // 5. Update MongoDB
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

        return res.status(200).json({ 
            status: "success", 
            message: "Booking updated", 
            ticketId 
        });

    } catch (error) {
        console.error("Webhook Logic Error:", error.message);
        return res.status(200).json({ status: "internal_error", error: error.message });
    }
});

module.exports = router;



        // const iface = new ethers.Interface([
        //     "event Deposit(string ticketId, address indexed user, uint256 amount)"
        // ]);