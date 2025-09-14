/** SPDX-License-Identifier: MIT */
pragma solidity ^0.8.24;

/**
 * @title SealedVote
 * @dev A commit-reveal voting system that ensures vote privacy during the commit phase
 *      and transparency during the reveal phase. This prevents vote buying and coercion
 *      while maintaining verifiable results.
 * @author TrueCount Team
 */
contract SealedVote {
    /**
     * @dev Poll structure containing all voting data
     * @param commitEnd Timestamp when the commit phase ends
     * @param numOptions Number of voting options (2-8)
     * @param creator Address of the poll creator
     * @param title Human-readable poll title
     * @param description Detailed poll description
     * @param options Array of voting option strings
     * @param commitment Mapping of voter addresses to their commitment hashes
     * @param revealed Mapping tracking which voters have revealed their votes
     * @param tally Array storing vote counts for each option
     */
    struct Poll {
        uint64 commitEnd;           // Commit phase end timestamp
        uint8  numOptions;          // Number of voting options (2-8)
        address creator;            // Poll creator address
        string title;               // Poll title
        string description;         // Poll description
        string[] options;           // Voting options array
        mapping(address => bytes32) commitment;  // Voter commitments (hashed votes)
        mapping(address => bool) revealed;       // Reveal status per voter
        uint32[] tally;             // Vote counts per option
    }

    // State variables
    mapping(uint256 => Poll) private _polls;  // Poll storage by ID
    uint256 public pollCount;                 // Total number of polls created

    // Events for frontend integration and transparency
    event PollCreated(uint256 indexed pollId, address indexed creator, uint8 numOptions, uint64 commitEnd, string title, string description);
    event Committed(uint256 indexed pollId, address indexed voter);
    event Revealed(uint256 indexed pollId, address indexed voter, uint8 optionIndex);

    /**
     * @dev Creates a new voting poll with specified parameters
     * @param numOptions Number of voting options (must be 2-8)
     * @param commitSeconds Duration of commit phase in seconds
     * @param title Human-readable poll title
     * @param description Detailed poll description
     * @param options Array of voting option strings
     * @return pollId Unique identifier for the created poll
     */
    function createPoll(uint8 numOptions, uint32 commitSeconds, string memory title, string memory description, string[] memory options)
        external returns (uint256 pollId)
    {
        // Input validation
        require(numOptions >= 2 && numOptions <= 8, "bad options");
        require(bytes(title).length > 0, "title required");
        require(bytes(description).length > 0, "description required");
        require(options.length == numOptions, "options length mismatch");
        
        // Calculate commit phase end time
        uint64 commitEnd = uint64(block.timestamp + commitSeconds);

        // Create new poll
        pollId = ++pollCount;
        Poll storage p = _polls[pollId];
        p.commitEnd = commitEnd;
        p.numOptions = numOptions;
        p.creator = msg.sender;
        p.title = title;
        p.description = description;
        p.options = options;
        p.tally = new uint32[](numOptions);  // Initialize tally array

        emit PollCreated(pollId, msg.sender, numOptions, commitEnd, title, description);
    }

    /**
     * @dev Commits a vote by submitting a hash commitment
     * @param pollId ID of the poll to vote in
     * @param commitment Hash of (optionIndex, salt, voter, pollId)
     * 
     * The commitment should be computed as:
     * keccak256(abi.encodePacked(optionIndex, salt, voter, pollId))
     * where salt is a random 32-byte value generated client-side
     */
    function commit(uint256 pollId, bytes32 commitment) external {
        Poll storage p = _polls[pollId];
        require(block.timestamp < p.commitEnd, "commit over");
        require(p.commitment[msg.sender] == bytes32(0), "already committed");
        
        // Store the commitment hash
        p.commitment[msg.sender] = commitment;
        emit Committed(pollId, msg.sender);
    }

    /**
     * @dev Reveals a previously committed vote
     * @param pollId ID of the poll to reveal vote in
     * @param optionIndex The option that was voted for (0-based index)
     * @param salt The random salt used in the original commitment
     * 
     * This function verifies that the revealed vote matches the original commitment
     * and then counts the vote in the final tally.
     */
    function reveal(uint256 pollId, uint8 optionIndex, bytes32 salt) external {
        Poll storage p = _polls[pollId];
        require(block.timestamp >= p.commitEnd, "commit phase not over");
        require(optionIndex < p.numOptions, "bad option");
        
        // Get the original commitment
        bytes32 c = p.commitment[msg.sender];
        require(c != bytes32(0), "no commit");
        require(!p.revealed[msg.sender], "already revealed");

        // Verify the commitment matches the revealed vote
        bytes32 recomputed = keccak256(abi.encodePacked(optionIndex, salt, msg.sender, pollId));
        require(recomputed == c, "mismatch");

        // Mark as revealed and count the vote
        p.revealed[msg.sender] = true;
        p.tally[optionIndex] += 1;
        emit Revealed(pollId, msg.sender, optionIndex);
    }


    // ============ VIEW FUNCTIONS FOR FRONTEND ============
    
    /**
     * @dev Returns the commit phase end timestamp for a poll
     * @param pollId ID of the poll
     * @return commitEnd Unix timestamp when commit phase ends
     */
    function getCommitEnd(uint256 pollId) external view returns (uint64 commitEnd) {
        return _polls[pollId].commitEnd;
    }
    
    /**
     * @dev Returns the number of options for a poll
     * @param pollId ID of the poll
     * @return Number of voting options
     */
    function getNumOptions(uint256 pollId) external view returns (uint8) {
        return _polls[pollId].numOptions;
    }
    
    /**
     * @dev Returns the current vote tally for a poll
     * @param pollId ID of the poll
     * @return tally Array of vote counts for each option
     */
    function getTally(uint256 pollId) external view returns (uint32[] memory tally) {
        return _polls[pollId].tally;
    }
    
    /**
     * @dev Returns the title of a poll
     * @param pollId ID of the poll
     * @return title Poll title
     */
    function getTitle(uint256 pollId) external view returns (string memory) {
        return _polls[pollId].title;
    }
    
    /**
     * @dev Returns the description of a poll
     * @param pollId ID of the poll
     * @return description Poll description
     */
    function getDescription(uint256 pollId) external view returns (string memory) {
        return _polls[pollId].description;
    }
    
    /**
     * @dev Returns the voting options for a poll
     * @param pollId ID of the poll
     * @return options Array of option strings
     */
    function getOptions(uint256 pollId) external view returns (string[] memory) {
        return _polls[pollId].options;
    }
    
    /**
     * @dev Returns the creator address of a poll
     * @param pollId ID of the poll
     * @return creator Address of the poll creator
     */
    function getCreator(uint256 pollId) external view returns (address) {
        return _polls[pollId].creator;
    }
    
    /**
     * @dev Checks if a voter has committed a vote
     * @param pollId ID of the poll
     * @param voter Address of the voter
     * @return true if voter has committed, false otherwise
     */
    function hasCommitted(uint256 pollId, address voter) external view returns (bool) {
        return _polls[pollId].commitment[voter] != bytes32(0);
    }
    
    /**
     * @dev Checks if a voter has revealed their vote
     * @param pollId ID of the poll
     * @param voter Address of the voter
     * @return true if voter has revealed, false otherwise
     */
    function hasRevealed(uint256 pollId, address voter) external view returns (bool) {
        return _polls[pollId].revealed[voter];
    }
}