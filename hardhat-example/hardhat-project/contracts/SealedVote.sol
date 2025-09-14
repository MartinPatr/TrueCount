/** SPDX-License-Identifier: MIT */
pragma solidity ^0.8.24;

contract SealedVote {
    struct Poll {
        uint64 commitEnd;
        uint64 revealEnd;
        uint8  numOptions;
        bool   finalized;
        address creator;
        mapping(address => bytes32) commitment;
        mapping(address => bool) revealed;
        uint32[] tally;
    }

    mapping(uint256 => Poll) private _polls;
    uint256 public pollCount;

    event PollCreated(uint256 indexed pollId, address indexed creator, uint8 numOptions, uint64 commitEnd, uint64 revealEnd);
    event Committed(uint256 indexed pollId, address indexed voter);
    event Revealed(uint256 indexed pollId, address indexed voter, uint8 optionIndex);
    event Finalized(uint256 indexed pollId, uint8 winningOption);

    function createPoll(uint8 numOptions, uint32 commitSeconds, uint32 revealSeconds)
        external returns (uint256 pollId)
    {
        require(numOptions >= 2 && numOptions <= 8, "bad options");
        uint64 commitEnd = uint64(block.timestamp + commitSeconds);
        uint64 revealEnd = uint64(commitEnd + revealSeconds);

        pollId = ++pollCount;
        Poll storage p = _polls[pollId];
        p.commitEnd = commitEnd;
        p.revealEnd = revealEnd;
        p.numOptions = numOptions;
        p.creator = msg.sender;
        p.tally = new uint32[](numOptions);

        emit PollCreated(pollId, msg.sender, numOptions, commitEnd, revealEnd);
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
        require(block.timestamp >= p.commitEnd && block.timestamp < p.revealEnd, "not reveal phase");
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

    function finalize(uint256 pollId) external returns (uint8 winning) {
        Poll storage p = _polls[pollId];
        require(!p.finalized, "finalized");
        require(block.timestamp >= p.revealEnd, "reveal not over");
        uint32 maxVotes = 0;
        for (uint8 i = 0; i < p.numOptions; i++) {
            if (p.tally[i] > maxVotes) { maxVotes = p.tally[i]; winning = i; }
        }
        p.finalized = true;
        emit Finalized(pollId, winning);
    }

    // Views for frontend
    function getPollTimes(uint256 pollId) external view returns (uint64 commitEnd, uint64 revealEnd) {
        Poll storage p = _polls[pollId];
        return (p.commitEnd, p.revealEnd);
    }
    function getNumOptions(uint256 pollId) external view returns (uint8) {
        return _polls[pollId].numOptions;
    }
    function getTally(uint256 pollId) external view returns (uint32[] memory tally, bool finalized) {
        Poll storage p = _polls[pollId];
        return (p.tally, p.finalized);
    }
    function hasCommitted(uint256 pollId, address voter) external view returns (bool) {
        return _polls[pollId].commitment[voter] != bytes32(0);
    }
    function hasRevealed(uint256 pollId, address voter) external view returns (bool) {
        return _polls[pollId].revealed[voter];
    }
}
