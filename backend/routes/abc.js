const express = require("express");
const Customer = require('../models/customers');
const router = express.Router();
const ethers = require("ethers");
const contractAbi = require('../abi.json');

const iface = new ethers.Interface(contractAbi);
const DEPOSIT_TOPIC = iface.getEvent("Deposit").topicHash;

router.post("/webhook", async (req, res) => {
  try {
    const logs = req.body.event?.data?.block?.logs;

    if (!logs || logs.length === 0) {
      return res.status(200).json({ status: "ignored" });
    }

    // ✅ FIND AND NORMALIZE THE LOG
    const depositLog = logs.find(rawLog => {
      // Handle both Alchemy data shapes
      const topics = Array.isArray(rawLog.topics) 
        ? rawLog.topics 
        : [rawLog.topic0, rawLog.topic1, rawLog.topic2, rawLog.topic3].filter(Boolean);
      
      return topics[0]?.toLowerCase() === DEPOSIT_TOPIC.toLowerCase();
    });

    if (!depositLog) {
      return res.status(200).json({ status: "ignored", message: "No Deposit event found" });
    }

    // ✅ RE-NORMALIZE TOPICS FOR ETHERS PARSING
    const finalTopics = Array.isArray(depositLog.topics) 
      ? depositLog.topics 
      : [depositLog.topic0, depositLog.topic1, depositLog.topic2, depositLog.topic3].filter(Boolean);

    let decoded;
    try {
      decoded = iface.parseLog({ topics: finalTopics, data: depositLog.data });
    } catch (parseError) {
      console.error("Decode failed:", parseError.message);
      return res.status(200).json({ status: "error", message: "ABI Mismatch" });
    }

    // ✅ USE INDICES FOR ARGS TO PREVENT NAMING ERRORS
    const ticketId      = decoded.args[0]; 
    const buyerAddress  = decoded.args[1]; 
    const amountWei     = decoded.args[2]; 

    const updatedBooking = await Customer.findOneAndUpdate(
      { ticket_id: ticketId },
      { 
        status: "paid", 
        transactionHash: depositLog.transaction?.hash, 
        buyer_address: buyerAddress 
      },
      { new: true }
    );

    if (!updatedBooking) {
      console.log("❌ ticket_id not found in DB:", ticketId);
      return res.status(200).json({ message: "Ticket not in DB", id: ticketId });
    }

    return res.status(200).json({ status: "success", ticketId });

  } catch (error) {
    console.error("Webhook error:", error.message);
    // Return 200 so Alchemy stops retrying a broken payload
    return res.status(200).json({ error: error.message });
  }
});

module.exports = router;