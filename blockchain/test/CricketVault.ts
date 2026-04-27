import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import hre from "hardhat"
import { parseEther, getAddress } from "viem";

describe("CricketVault", async function () {
//   const { viem } = await (hre as any).viem.getOrCreate()
  const { viem } = await (network as any).create();
  const publicClient = await viem.getPublicClient();

  it("Should emit the Deposit event when calling the buyTicket() function", async function () {
    const [owner] = await viem.getWalletClients();
    // 1. Target the new contract name
    const vault = await viem.deployContract("CricketVault");
    const amount = parseEther("1.0");

    // 2. Fix: Pass an empty array [] for function arguments, 
    // then the { value } object as the second parameter.
    await viem.assertions.emitWithArgs(
      vault.write.buyTicket({ 
        args: [], 
        value: amount 
      }),
      vault,
      "Deposit",
      [getAddress(owner.account.address), amount],
    );
  });

  it("The sum of the Deposit events should match the stored original price", async function () {
    const [owner] = await viem.getWalletClients();
    const vault = await viem.deployContract("CricketVault");
    const deploymentBlockNumber = await publicClient.getBlockNumber();
    const amount = parseEther("1.0");

    // 3. Fix: Update function name and parameter syntax
    for (let i = 0; i < 3; i++) {
      await  vault.write.buyTicket({ 
        args: [], 
        value: amount 
      })
    }

    const events = await publicClient.getContractEvents({
      address: vault.address,
      abi: vault.abi,
      eventName: "Deposit",
      fromBlock: deploymentBlockNumber,
      strict: true,
    });

    let total = 0n;
    for (const event of events) {
      total += (event as any).args.amount;
    }

    // 4. Update: Check against originalPrices instead of balances
    // Since each mint is unique, we check the latest minted ID (2) 
    // or verify the count of events.
    const lastTicketPrice = await vault.read.originalPrices([2n]);
    
    assert.equal(total, amount * 3n);
    assert.equal(lastTicketPrice, amount);
  });
});