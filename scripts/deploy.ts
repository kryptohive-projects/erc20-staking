import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Example ERC20 token address (replace with actual token address)
  const tokenAddress = "0xB8c77482e45F1F44dE1745F52C74426C631bDD52"; // Replace with your ERC20 token address 
  const rewardRate = ethers.parseUnits("1", 18); // Example reward rate

  // Deploy the Staking contract
  const Staking = await ethers.getContractFactory("Staking");
  const staking = await Staking.deploy(tokenAddress, rewardRate);

  await staking.waitForDeployment(); // Correct method to wait for deployment

  console.log(
    `Staking contract deployed to ${await staking.getAddress()}`
  );
}

// Handle errors
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
