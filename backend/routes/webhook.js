const express = require("express");
const Customer = require('../models/customers');
const router = express.Router();
const ethers = require("ethers");

const CRICKET_VAULT_ABI = [
  "event Deposit(string ticketId, address indexed user, uint256 amount)"
];

router.post("/webhook", async (req, res) => {
  try {
    const logs = req.body.event?.data?.block?.logs;

    if (!logs || logs.length === 0) {
      console.log("No logs found. This might be a test ping.");
      return res.status(200).json({ status: "ignored" });
    }

    const transactionHash = logs[0].transaction?.hash;
    const iface = new ethers.Interface(CRICKET_VAULT_ABI)
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
    //     res.status(200).json({ status: "error", message: `Logs: ${logs}`  });
    //     res.status(200).json({ status: "error", message: "Decoded as null" });
    //     return
    // }

    // if (!decoded) {
    //     return res.status(200).json({ 
    //         status: "error", 
    //         message: "Decoded as null",
    //         receivedLogs: logs // This allows you to see the raw data in Postman
    //     });
    // }


    if (!decoded) {
        const eventSig = "Deposit(string,address,uint256)";
        const calcHash = ethers.id(eventSig);
        
        return res.status(200).json({ 
            status: "error", 
            message: "Decoded as null",
            debug: {
                expectedLen: calcHash.length,
                receivedLen: logs[0].topics[0].length,
                // This will show if there are hidden characters
                expectedRaw: JSON.stringify(calcHash), 
                receivedRaw: JSON.stringify(logs[0].topics[0]),
                match: calcHash.trim() === logs[0].topics[0].trim()
            }
        });
    }

    const ticketId = decoded.args.ticketId; 

    const updatedBooking = await Customer.findOneAndUpdate(
      { ticket_id: ticketId },
      { 
        status: "paid", 
        transactionHash: transactionHash,
      },
      { returnDocument: 'after' }
    );

    if (!updatedBooking) {
      console.log("Ticket ID not found in DB:", ticketId);
      return res.status(200).json({ message: "Order not in DB", id: ticketId });
    }

    console.log("Verified Booking Updated to Paid:", ticketId);
    res.status(200).json({ status: "success", ticketId }); 

  } catch (error) {
    console.error("Webhook Logic Error:", error.message);
    res.status(200).json({ error: error.message });
  }
});

module.exports = router;