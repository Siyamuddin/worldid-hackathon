// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
// this program creates the reward token itself (the thing we give to human)
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RewardToken is ERC20, Ownable(msg.sender) {
    constructor() ERC20("Human Reward Token", "HRT") {}

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}