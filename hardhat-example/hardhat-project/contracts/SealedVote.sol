/** SPDX-License-Identifier: MIT */
pragma solidity ^0.8.24;

contract SealedVote {
    struct Poll {
        uint64 commitEnd;
        uint8  numOptions;
        address creator;
        mapping(address => bytes32) commitment;
        mapping(address => bool) revealed;
        uint32[] tally;
    }

    mapping(uint256 => Poll) private _polls;
    uint256 public pollCount;

    event PollCreated(uint256 indexed pollId, address indexed creator, uint8 numOptions, uint64 commitEnd);
    event Committed(uint256 indexed pollId, address indexed voter);
    event Revealed(uint256 indexed pollId, address indexed voter, uint8 optionIndex);

    function createPoll(uint8 numOptions, uint32 commitSeconds)
        external returns (uint256 pollId)
    {
        require(numOptions >= 2 && numOptions <= 8, "bad options");
        uint64 commitEnd = uint64(block.timestamp + commitSeconds);

        pollId = ++pollCount;
        Poll storage p = _polls[pollId];
        p.commitEnd = commitEnd;
        p.numOptions = numOptions;
        p.creator = msg.sender;
        p.tally = new uint32[](numOptions);

        emit PollCreated(pollId, msg.sender, numOptions, commitEnd);
    }

    function commit(uint256 pollId, bytes32 commitment) external {
        Poll storage p = _polls[pollId];
        require(block.timestamp < p.commitEnd, "commit over");
        require(p.commitment[msg.sender] == bytes32(0), "already committed");
        p.commitment[msg.sender] = commitment;
        emit Committed(pollId, msg.sender);
    }

    function reveal(uint256 pollId, uint8 optionIndex, bytes32 salt) external {
        Poll storage p = _polls[pollId];
        require(block.timestamp >= p.commitEnd, "commit phase not over");
        require(optionIndex < p.numOptions, "bad option");
        bytes32 c = p.commitment[msg.sender];
        require(c != bytes32(0), "no commit");
        require(!p.revealed[msg.sender], "already revealed");

        bytes32 recomputed = keccak256(abi.encodePacked(optionIndex, salt, msg.sender, pollId));
        require(recomputed == c, "mismatch");

        p.revealed[msg.sender] = true;
        p.tally[optionIndex] += 1;
        emit Revealed(pollId, msg.sender, optionIndex);
    }


    // Views for frontend
    function getCommitEnd(uint256 pollId) external view returns (uint64 commitEnd) {
        return _polls[pollId].commitEnd;
    }
    function getNumOptions(uint256 pollId) external view returns (uint8) {
        return _polls[pollId].numOptions;
    }
    function getTally(uint256 pollId) external view returns (uint32[] memory tally) {
        return _polls[pollId].tally;
    }
    function hasCommitted(uint256 pollId, address voter) external view returns (bool) {
        return _polls[pollId].commitment[voter] != bytes32(0);
    }
    function hasRevealed(uint256 pollId, address voter) external view returns (bool) {
        return _polls[pollId].revealed[voter];
    }
}