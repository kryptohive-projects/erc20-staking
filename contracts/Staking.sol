// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Staking is Ownable {
    IERC20 public stakingToken;
    uint256 public rewardRate; // Reward rate per second
    uint256 public lastUpdateTime;
    mapping(address => uint256) public userStakes;
    mapping(address => uint256) public rewards;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);

    constructor(IERC20 _stakingToken, uint256 _rewardRate) Ownable(msg.sender) {
        stakingToken = _stakingToken;
        rewardRate = _rewardRate;
        lastUpdateTime = block.timestamp;
    }

    modifier updateReward(address account) {
        rewards[account] = earned(account);
        lastUpdateTime = block.timestamp;
        _;
    }

    function stake(uint256 amount) external updateReward(msg.sender) {
        require(amount > 0, "Cannot stake 0");
        userStakes[msg.sender] += amount;
        stakingToken.transferFrom(msg.sender, address(this), amount);
        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) external updateReward(msg.sender) {
        require(amount > 0, "Cannot unstake 0");
        require(userStakes[msg.sender] >= amount, "Insufficient staked amount");
        userStakes[msg.sender] -= amount;
        stakingToken.transfer(msg.sender, amount);
        emit Unstaked(msg.sender, amount);
    }

    function earned(address account) public view returns (uint256) {
        return (userStakes[account] * rewardRate * (block.timestamp - lastUpdateTime)) / 1e18;
    }

    function claimReward() external updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        require(reward > 0, "No reward available");
        rewards[msg.sender] = 0;
        stakingToken.transfer(msg.sender, reward);
        emit RewardPaid(msg.sender, reward);
    }

    // Owner functions
    function setRewardRate(uint256 _rewardRate) external onlyOwner {
        rewardRate = _rewardRate;
    }

    // Function to withdraw tokens sent accidentally to this contract
    function withdrawTokens(address tokenAddress, uint256 amount) external onlyOwner {
        IERC20(tokenAddress).transfer(owner(), amount);
    }
}
