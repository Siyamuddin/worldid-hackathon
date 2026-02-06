// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// security guard + rule engine

// description of another contract...there is a contract WorldID 
// that has a function called verifyProof
interface IWorldID 
{
    function verifyProof(
        uint256 root,
        uint256 groupId,
        uint256 signalHash,
        uint256 nullifierHash,
        uint256 externalNullifierHash,
        uint256[8] calldata proof
    ) external view;
}

// this lets the contract talk to RewardToken contract 
//and tell it to create token
interface IRewardToken 
{
    function mint(address to, uint256 amount) external;
}

// the start of main contract (the rule engine)
contract HumanReward
{
    // storing important contract addresses
    IWorldID public worldId;        // the official world if contract 
    IRewardToken public rewardToken; // our token contract

    mapping(uint256 => bool) public nullifierHashes; // anti-cheat database

    uint256 public constant groupId = 1; // World ID's verified humans group
    uint256 public rewardAmount = 10 * 10**18; // we give 10 tokens per human

    // runs once at deployment
    // during deployment we provide the World ID contract address
    // and Reward Token contract address
    constructor(address _worldId, address _rewardToken)
    {
        worldId = IWorldID(_worldId);
        rewardToken = IRewardToken(_rewardToken);
    }

    // frontend calls
    function claimReward(
        uint256 root,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) external 
    {
        require(!nullifierHashes[nullifierHash], "Already claimed");  // stop double claims

        // proof is linked to THIS wallet
        // proof is linked to THIS specific app action
        // prevents reuse of the same proof elsewhere
        uint256 signalHash = uint256(keccak256(abi.encodePacked(msg.sender)));
        uint256 externalNullifierHash = uint256(keccak256(abi.encodePacked("claim-reward")));

        // ask world id to verify
        worldId.verifyProof(
            root,
            groupId,
            signalHash,
            nullifierHash,
            externalNullifierHash,
            proof
        );

        nullifierHashes[nullifierHash] = true; // marked human as claimed

        rewardToken.mint(msg.sender, rewardAmount); // create tokens and send them to wallet
    }
}