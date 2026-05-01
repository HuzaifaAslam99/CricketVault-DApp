const express = require("express");
const Customer = require('../models/customers');
const router = express.Router();
const ethers = require("ethers");
const contractAbi = require('../abi.json');


// const iface = new ethers.Interface([
//   "event Deposit(string ticketId, address indexed user, uint256 amount)",
//   "event TicketMinted(uint256 indexed tokenId, string ticketId, string ipfsHash)"
// ]);

const iface = new ethers.Interface(contractAbi);

const DEPOSIT_TOPIC = iface.getEvent("Deposit").topicHash;

router.post("/webhook", async (req, res) => {
  try {
    const logs = req.body.event?.data?.block?.logs;

    if (!logs || logs.length === 0) {
      console.log("No logs found.");
      return res.status(200).json({ status: "ignored" });
    }

    // ✅ Find the Deposit log specifically (ignore TicketMinted)
    const depositLog = logs.find(log => log.topics[0] === DEPOSIT_TOPIC);

    if (!depositLog) {
      console.log("No Deposit event in this block.");
      return res.status(200).json({ status: "ignored" });
    }

    const transactionHash = depositLog.transaction?.hash;

    let decoded;
    try {
      decoded = iface.parseLog(depositLog);
    } catch (parseError) {
      console.log("DECODE FAILED:", parseError.message);
      return res.status(200).json({ status: "error", message: "ABI Mismatch" });
    }

    if (!decoded) {
      return res.status(200).json({ status: "error", message: "Decoded as null" });
    }

    const ticketId     = decoded.args.ticketId;
    const buyerAddress = decoded.args.user;
    const amountWei    = decoded.args.amount;

    console.log("✅ Decoded Deposit:", {
      ticketId,
      buyerAddress,
      amountEth: ethers.formatEther(amountWei),
      transactionHash,
    });

    const updatedBooking = await Customer.findOneAndUpdate(
      { ticket_id: ticketId },
      { status: "paid", transactionHash, buyer_address: buyerAddress },
      { new: true }
    );

    if (!updatedBooking) {
      console.log("❌ ticket_id not found in DB:", ticketId);
      return res.status(200).json({ message: "Ticket not in DB", id: ticketId });
    }

    console.log("✅ Booking marked paid:", ticketId);
    res.status(200).json({ status: "success", ticketId });

  } catch (error) {
    console.error("Webhook error:", error.message);
    res.status(200).json({ error: error.message });
  }
});

module.exports = router;