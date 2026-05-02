const express = require("express");
const Customer = require('../models/customers');
const router = express.Router();
const ethers = require("ethers");
const contractAbi = require('../abi.json');
const verifyAlchemy = require("../middleware/verifyAlchemy");

// Pre-compute the Deposit event topic so we can filter precisely
const iface = new ethers.Interface(contractAbi);
const DEPOSIT_TOPIC = iface.getEvent("Deposit").topicHash;
console.log("Expected Deposit topic0:", DEPOSIT_TOPIC);

router.post("/webhook", verifyAlchemy, async (req, res) => {
  try {
    // Always 200 to Alchemy — never let it retry and double-update
    const logs = req.body.event?.data?.block?.logs;

    if (!logs || logs.length === 0) {
      return res.status(200).json({ status: "ignored" });
    }

    for (const rawLog of logs) {

      // ✅ Normalize topics — handle both Shape A and Shape B
      
      let topics;
      if (Array.isArray(rawLog.topics)) {
        topics = rawLog.topics;                          // Shape A
      } else {
        topics = [                                       // Shape B
          rawLog.topic0,
          rawLog.topic1,
          rawLog.topic2,
          rawLog.topic3,
        ].filter(Boolean);
      }

      // ✅ Quick filter — skip logs that aren't our Deposit event
      if (!topics[0] || topics[0].toLowerCase() !== DEPOSIT_TOPIC.toLowerCase()) {
        console.log("Skipping unrelated log, topic0:", topics[0]);
        continue;
      }

      const data = rawLog.data;
      const transactionHash = rawLog.transaction?.hash;

      console.log("Attempting to parse log:");
      console.log("  topics:", topics);
      console.log("  data:", data);

      // ✅ Build exactly what ethers expects
      let decoded;
      try {
        decoded = iface.parseLog({ topics, data });
      } catch (err) {
        console.error("parseLog failed even after normalization:", err.message);
        // Data might be missing or malformed — skip this log
        continue;
      }

      if (!decoded || decoded.name !== "Deposit") continue;

      // ✅ Access by index — always safe regardless of ABI naming
      const bookingId      = decoded.args[0];          // string  (non-indexed)
      const buyerAddress  = decoded.args[1];          // address (indexed)
      const amountWei     = decoded.args[2];          // uint256 (non-indexed)

      console.log("Decoded Deposit:", {
        bookingId,
        buyerAddress,
        amountEth: ethers.formatEther(amountWei),
        transactionHash,
      });


      const updatedBooking = await Customer.findOneAndUpdate(
        { booking_id: bookingId },
        {
          status: "paid",
          transactionHash: transactionHash,
          buyer_address: buyerAddress,
        },
        { returnDocument: 'after' }
      );

      if (!updatedBooking) {
        console.error("ticket_id not found in DB:", ticketId);
      } else {
        console.log("✅ Booking marked paid:", ticketId);
      }
    }

    return res.status(200).json({ status: "success" });

  } catch (error) {
    console.error("Webhook error:", error.message);
    return res.status(200).json({ error: error.message });
  }
});

module.exports = router;