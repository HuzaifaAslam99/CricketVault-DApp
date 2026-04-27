const Tickets = require('../models/tickets');
const express = require("express")
const router = express.Router()

router.get("/tickets", async (req, res) => {
    try {
        // console.log("We are in th Tickets");
        
        const allTickets = await Tickets.find()
        // console.log(allTickets);
        
        if ((allTickets.length === 0)){
            return res.status(400).json({ message: "Tickets not available"});
        }
        res.status(200).json(allTickets);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Cannot Access Data", error: err.message });
    }
});



router.get("/tickets/match", async (req, res) => {
    try {
        const { match } = req.query;
          
        if (!match) {
            return res.status(400).json({ message: "Match Id is required" });
        }

        const Match = await Tickets.findOne({match})
     
        if (!Match) return res.status(404).json({ message: "Match not found in DB" });

        res.status(200).json(Match);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Cannot Access Data", error: err.message });
    }
});




module.exports = router