# Staking Contract

## Overview

The `Staking` contract is a smart contract that allows users to stake ERC20 tokens and earn rewards over time. The contract supports staking, unstaking, claiming rewards, and adjusting the reward rate. It is also equipped with functionalities for the contract owner to withdraw mistakenly sent tokens.

## Features

- **Staking Tokens**: Users can stake ERC20 tokens and earn rewards based on the time and amount staked.
- **Unstaking Tokens**: Users can withdraw their staked tokens.
- **Reward Calculation**: Rewards are calculated based on the time tokens have been staked and the reward rate.
- **Claiming Rewards**: Users can claim their accumulated rewards.
- **Owner Controls**: The contract owner can adjust the reward rate and withdraw tokens sent to the contract accidentally.

## Contract Functions

### `constructor(IERC20 _stakingToken, uint256 _rewardRate)`

- **Parameters**:
  - `_stakingToken`: Address of the ERC20 token used for staking.
  - `_rewardRate`: Initial reward rate per second (in wei).

### `function stake(uint256 amount) external updateReward(msg.sender)`

- **Parameters**:
  - `amount`: Amount of tokens to stake.
- **Functionality**: Stakes the specified amount of tokens and updates the user's reward.

### `function unstake(uint256 amount) external updateReward(msg.sender)`

- **Parameters**:
  - `amount`: Amount of tokens to unstake.
- **Functionality**: Withdraws the specified amount of tokens from staking.

### `function earned(address account) public view returns (uint256)`

- **Parameters**:
  - `account`: Address of the user.
- **Returns**: `uint256` - The amount of reward earned by the user.

### `function claimReward() external updateReward(msg.sender)`

- **Functionality**: Claims the user's earned rewards and transfers them to the user's address.

### `function setRewardRate(uint256 _rewardRate) external onlyOwner`

- **Parameters**:
  - `_rewardRate`: New reward rate per second (in wei).
- **Functionality**: Allows the owner to set a new reward rate.

### `function withdrawTokens(address tokenAddress, uint256 amount) external onlyOwner`

- **Parameters**:
  - `tokenAddress`: Address of the ERC20 token to withdraw.
  - `amount`: Amount of tokens to withdraw.
- **Functionality**: Allows the owner to withdraw tokens sent accidentally to the contract.

## Events

- **`Staked(address indexed user, uint256 amount)`**: Emitted when tokens are staked.
- **`Unstaked(address indexed user, uint256 amount)`**: Emitted when tokens are unstaked.
- **`RewardPaid(address indexed user, uint256 reward)`**: Emitted when rewards are claimed.

## Usage

1. **Deploy the Contract**: Deploy the `Staking` contract with the desired ERC20 token and reward rate.

2. **Stake Tokens**: Call the `stake` function to deposit tokens into the staking contract.

3. **Unstake Tokens**: Call the `unstake` function to withdraw tokens from staking.

4. **Claim Rewards**: Call the `claimReward` function to claim earned rewards.

5. **Adjust Reward Rate**: Use the `setRewardRate` function to change the reward rate.

6. **Withdraw Tokens**: If tokens are sent to the contract by mistake, use the `withdrawTokens` function to retrieve them.

## Example

```javascript
// Example in JavaScript using ethers.js

const { ethers } = require("ethers");
const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
const signer = provider.getSigner();

const Staking = await ethers.getContractFactory("Staking");
const stakingToken = await ethers.getContractAt("IERC20", "0xTokenAddress");
const stakingContract = await Staking.deploy(stakingToken.address, ethers.utils.parseUnits("1", "18"));
await stakingContract.deployed();

// Stake tokens
await stakingToken.approve(stakingContract.address, ethers.utils.parseUnits("100", "18"));
await stakingContract.stake(ethers.utils.parseUnits("100", "18"));

// Unstake tokens
await stakingContract.unstake(ethers.utils.parseUnits("50", "18"));

// Claim rewards
await stakingContract.claimReward();
