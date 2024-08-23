// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract TreasureHunt is ReentrancyGuard {
    uint8 public constant GRID_SIZE = 10;
    uint8 public constant TOTAL_CELLS = GRID_SIZE * GRID_SIZE;
    uint8 public treasurePosition;
    uint256 public round;
    uint256 public prizePool;
    address public winner;

    address[] public players; // List of players
    mapping(address => uint8) public playerPositions; // Players Position on the Grid
    mapping(address => bool) public hasMoved; // A player Moved or not on a Perticular round

    event PlayerMoved(address indexed player, uint8 position);
    event TreasureMoved(uint8 newPosition);
    event GameWon(address indexed winner, uint256 prize);

    constructor() payable {
        treasurePosition = uint8(uint256(keccak256(abi.encodePacked(block.timestamp, block.number))) % TOTAL_CELLS);
        round = 1;
    }

    modifier onlyOncePerRound() {
        require(!hasMoved[msg.sender], "Player has already moved this round.");
        _;
    }

    modifier validMove(uint8 newPosition) {
        require(newPosition < TOTAL_CELLS, "Invalid move.");
        require(isAdjacent(playerPositions[msg.sender], newPosition), "Move must be adjacent.");
        _;
    }

    function move(uint8 newPosition) public payable onlyOncePerRound validMove(newPosition) nonReentrant {
        require(msg.value > 0, "Must send ETH to participate.");

        // Register player's move
        if (playerPositions[msg.sender] == 0) {
            players.push(msg.sender); // Add new player to the list
        }
        playerPositions[msg.sender] = newPosition;
        prizePool += msg.value;
        hasMoved[msg.sender] = true;

        emit PlayerMoved(msg.sender, newPosition);

        // Check for winning condition
        if (newPosition == treasurePosition) {
            _winGame();
        } else {
            _moveTreasure(newPosition);
        }
    }

    function _moveTreasure(uint8 playerPosition) internal {
        if (playerPosition % 5 == 0) {
            // Move treasure to a random adjacent position
            treasurePosition = _getRandomAdjacentPosition(treasurePosition);
        } else if (_isPrime(playerPosition)) {
            // Move treasure to a completely new random position
            treasurePosition = uint8(uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao))) % TOTAL_CELLS);
        }

        emit TreasureMoved(treasurePosition);
    }

    function _winGame() internal {
        winner = msg.sender;
        uint256 reward = (prizePool * 90) / 100;
        payable(winner).transfer(reward);
        prizePool = address(this).balance; // Remaining 10% stays for the next round
        emit GameWon(winner, reward);

        _resetGame();
    }

    function _resetGame() internal {
        round++;
        treasurePosition = uint8(uint256(keccak256(abi.encodePacked(block.timestamp, block.number))) % TOTAL_CELLS);

        // Reset player movements for the new round
        for (uint256 i = 0; i < players.length; i++) {
            hasMoved[players[i]] = false;
        }
    }

    function _getRandomAdjacentPosition(uint8 currentPosition) internal view returns (uint8) {
        uint8[] memory adjacentPositions = _getAdjacentPositions(currentPosition);
        return adjacentPositions[uint256(keccak256(abi.encodePacked(block.timestamp))) % adjacentPositions.length];
    }

    function _getAdjacentPositions(uint8 position) internal pure returns (uint8[] memory) {
        uint8 count = 0;

        // Count the number of valid adjacent positions
        if (position >= GRID_SIZE) count++; // Up
        if (position < TOTAL_CELLS - GRID_SIZE) count++; // Down
        if (position % GRID_SIZE != 0) count++; // Left
        if ((position + 1) % GRID_SIZE != 0) count++; // Right

        uint8[] memory adjacent = new uint8[](count);
        count = 0;

        // Populate the adjacent positions
        if (position >= GRID_SIZE) adjacent[count++] = position - GRID_SIZE; // Up
        if (position < TOTAL_CELLS - GRID_SIZE) adjacent[count++] = position + GRID_SIZE; // Down
        if (position % GRID_SIZE != 0) adjacent[count++] = position - 1; // Left
        if ((position + 1) % GRID_SIZE != 0) adjacent[count++] = position + 1; // Right

        return adjacent;
    }

    function _isPrime(uint8 num) internal pure returns (bool) {
        if (num < 2) return false;
        for (uint8 i = 2; i * i <= num; i++) {
            if (num % i == 0) return false;
        }
        return true;
    }

    function isAdjacent(uint8 pos1, uint8 pos2) internal pure returns (bool) {
        return (pos1 == pos2 + 1 || pos1 == pos2 - 1 || pos1 == pos2 + GRID_SIZE || pos1 == pos2 - GRID_SIZE);
    }
}
