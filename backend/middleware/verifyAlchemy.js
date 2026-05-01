const crypto = require("crypto");

const verifyAlchemySignature = (req, res, next) => {
  const signature = req.headers["x-alchemy-signature"];
  const signingKey = process.env.ALCHEMY_SIGNING_KEY;

  if (!signature) return res.status(401).json({ error: "No signature" });

  // req.rawBody is the binary Buffer captured in server.js
  const hmac = crypto.createHmac("sha256", signingKey);
  hmac.update(req.rawBody); // No need for .toString() or "utf8"
  const digest = hmac.digest("hex");

  if (signature !== digest) {
    console.error("Signature Mismatch!");
    return res.status(401).json({ error: "Invalid signature" });
  }

  console.log("Alchemy Signature Validated");

  next();
};

module.exports = verifyAlchemySignature;