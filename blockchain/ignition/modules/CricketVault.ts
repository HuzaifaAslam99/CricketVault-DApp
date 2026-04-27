import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const CricketVaultModule = buildModule("CricketVaultModule", (m) => {
  // Matches your "CricketVault.sol" file and contract name
  const cricketVault = m.contract("CricketVault");

  return { cricketVault };
});

export default CricketVaultModule;