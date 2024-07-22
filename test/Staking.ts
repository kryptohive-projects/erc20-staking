import { expect } from "chai";
import { ethers } from "hardhat";
import { Staking, ERC20Mock } from "../typechain";
import { Signer } from "ethers";

describe("Staking Contract", function () {
  let staking: Staking;
  let stakingToken: ERC20Mock;
  let owner: Signer;
  let addr1: Signer;
  let addr2: Signer;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy the mock ERC20 token
    const Token = await ethers.getContractFactory("ERC20Mock");
    stakingToken = await Token.deploy("Mock Token", "MTK", ethers.parseUnits("10000", 18));
    await stakingToken.waitForDeployment();
    const stakingTokenAddress = await stakingToken.getAddress()
   
    // Deploy the Staking contract
    const StakingFactory = await ethers.getContractFactory("Staking");
    staking = await StakingFactory.deploy(stakingTokenAddress, ethers.parseUnits("0.001", 18)); // 1 reward per second
    await staking.waitForDeployment();

    // Transfer some tokens to addr1 for staking
    await stakingToken.transfer(await addr1.getAddress(), ethers.parseUnits("1000", 18));
    await stakingToken.transfer(await staking.getAddress(), ethers.parseUnits("1000", 18));
    await stakingToken.connect(addr1).approve(await staking.getAddress(), ethers.parseUnits("100", 18));


  });

  it("should allow users to stake tokens", async function () {
    await staking.connect(addr1).stake(ethers.parseUnits("100", 18));
    expect(await staking.userStakes(await addr1.getAddress())).to.equal(ethers.parseUnits("100", 18));
  });

  it("should allow users to unstake tokens", async function () {
    await staking.connect(addr1).stake(ethers.parseUnits("100", 18));
    await staking.connect(addr1).unstake(ethers.parseUnits("50", 18));
    expect(await staking.userStakes(await addr1.getAddress())).to.equal(ethers.parseUnits("50", 18));
  });

  it("should calculate rewards correctly", async function () {
    await staking.connect(addr1).stake(ethers.parseUnits("100", 18));
    // Fast-forward time by 1 hour
    await ethers.provider.send("evm_increaseTime", [3600]);
    await ethers.provider.send("evm_mine", []);
    const reward = await staking.earned(await addr1.getAddress());
    expect(reward).to.be.gt(0);
  });

  it("should allow users to claim rewards", async function () {
    await staking.connect(addr1).stake(ethers.parseUnits("100", 18));
    // Fast-forward time by 1 hour
    await ethers.provider.send("evm_increaseTime", [3600]);
    await ethers.provider.send("evm_mine", []);
    // const initialBalance = await ethers.provider.getBalance(await addr1.getAddress());
    const initialBalance = await stakingToken.balanceOf(await addr1.getAddress());
    
    await staking.connect(addr1).claimReward();
    const finalBalance = await stakingToken.balanceOf(await addr1.getAddress());
    expect(finalBalance).to.be.gt(initialBalance);
  });

  it("should allow the owner to set reward rate", async function () {
    await staking.setRewardRate(ethers.parseUnits("2", 18)); // Set new reward rate
    expect(await staking.rewardRate()).to.equal(ethers.parseUnits("2", 18));
  });

  it("should allow the owner to withdraw tokens sent accidentally", async function () {
    await stakingToken.transfer(await staking.getAddress(), ethers.parseUnits("500", 18));
    await staking.withdrawTokens(await stakingToken.getAddress(), ethers.parseUnits("500", 18));
    expect(await stakingToken.balanceOf(await owner.getAddress())).to.be.eq(ethers.parseUnits("8000", 18));
  });
});
