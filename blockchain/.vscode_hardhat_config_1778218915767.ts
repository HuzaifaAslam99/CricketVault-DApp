import { defineConfig } from "hardhat/config";
// import "@nomicfoundation/hardhat-toolbox-viem";
// import "@nomicfoundation/hardhat-ignition-viem";
import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";

import * as dotenv from "dotenv";

dotenv.config();

const RPC_URL = "https://sepolia.base.org";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

export default defineConfig({

  plugins: [hardhatToolboxViemPlugin],
  
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    baseSepolia: {
      type: "http", 
      url: RPC_URL,
      chainId: 84532,
      accounts: PRIVATE_KEY !== "" ? [PRIVATE_KEY] : [],
    },
  },
  // Use 'verify' for Viem-based projects
  verify: {
    etherscan: {
      apiKey: process.env.ETHERSCAN_API_KEY || "",
    },
  },
});