const express = require("express");
const Customer = require('../models/customers');
const router = express.Router();
const ethers = require("ethers");
const contractAbi = require('../abi.json');

router.post("/webhook", async (req, res) => {
    try {
        // 1. Path Resilience: Check common Alchemy payload structures
        const logs = req.body.event?.data?.block?.logs || req.body.event?.data?.logs || [];

        if (!logs || logs.length === 0) {
            console.log("No logs found. Payload might be a test ping.");
            return res.status(200).json({ status: "ignored", message: "No logs array found" });
        }

        const iface = new ethers.Interface(contractAbi);

        // 2. Constants for filtering (Normalizing to lowercase for comparison)
        const ACTUAL_DEPOSIT_HASH = "0xd327b35e36b3981157588978d60961ff5c09dc2926008abb1dd77b1197a416ed".toLowerCase();
        const VAULT_ADDRESS = "0x7Ce5D05474fabA0Cf8910Bd25B2eDe407F11Fc4c".toLowerCase();

        // 3. Find the specific log with Diagnostic Tracking
        let diagnosticData = [];
        const depositLog = logs.find((log, index) => {
            const logAddr = log?.address?.toLowerCase();
            const logTopic = log?.topics?.[0]?.toLowerCase();
            
            const isMatch = (logAddr === VAULT_ADDRESS && logTopic === ACTUAL_DEPOSIT_HASH);
            
            // Store results of every log checked to debug mismatches
            diagnosticData.push({
                index,
                match: isMatch,
                receivedAddr: logAddr,
                receivedTopic: logTopic
            });

            return isMatch;
        });

        // 4. Handle Case: Log not found
        if (!depositLog) {
            console.error("Authentic Deposit log not found.");
            return res.status(200).json({ 
                status: "error", 
                message: "Authentic Deposit log not found",
                diagnostics: diagnosticData // This will show you exactly what was received in Postman/Logs
            });
        }

        const transactionHash = depositLog.transaction?.hash || "unknown_hash";
        let decoded = null;

        try {
            // 5. Attempt Standard Decode
            decoded = iface.parseLog({
                topics: depositLog.topics,
                data: depositLog.data
            });
        } catch (parseError) {
            console.log("Standard parse failed (Topic0 mismatch). Using Manual Fallback.");
            
            // 6. Manual Fallback Decode (Bypasses ABI Signature Check)
            const abiCoder = new ethers.AbiCoder();
            // Data = [string ticketId, uint256 amount]
            const decodedData = abiCoder.decode(["string", "uint256"], depositLog.data);
            
            decoded = {
                args: {
                    ticketId: decodedData[0],
                    amount: decodedData[1],
                    // Extract indexed user address from topics[1]
                    user: ethers.getAddress(ethers.dataSlice(depositLog.topics[1], 12))
                }
            };
        }

        const ticketId = decoded.args.ticketId; 
        console.log(`Processing payment for Ticket ID: ${ticketId}`);

        // 7. Update MongoDB
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
        return res.status(200).json({ status: "internal_error", error: error.message });
    }
});

module.exports = router;


        // const iface = new ethers.Interface([
        //     "event Deposit(string ticketId, address indexed user, uint256 amount)"
        // ]);