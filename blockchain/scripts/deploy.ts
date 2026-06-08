import hre from "hardhat";

async function main() {
  console.log("Starting deployment to Base Sepolia...");

  // Changed "Vault" to "CricketVault" to match your new smart contract
  const vault = await (hre as any).viem.deployContract("CricketVault");

  console.log(`Success! CricketVault deployed to: ${vault.address}`);
}

main().catch((error) => {
  console.error("Deployment failed:");
  console.error(error);
  process.exitCode = 1;
});