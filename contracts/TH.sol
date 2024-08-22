// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract TreasureHunt is ReentrancyGuard {
    uint256 public immutable GRID_SIZE = 100;
    uint256 public treasurePosition;
    address public winner;

    mapping(address => uint256) public playerPositions;

    event PlayerMoved(address indexed player, uint256 position);
    event TreasureMoved(uint256 newPosition);
    event GameWon(address indexed player, uint256 prize);

    constructor() payable {
        // Initialize treasure at a random position based on the block number
        treasurePosition = uint256(keccak256(abi.encodePacked(blockhash(block.number)))) % GRID_SIZE;
    }

    function movePlayer(uint256 newPosition) external payable nonReentrant {
        require(msg.value > 0, "You must send ETH to move.");
        require(newPosition < GRID_SIZE, "Invalid position.");

        playerPositions[msg.sender] = newPosition;
        emit PlayerMoved(msg.sender, newPosition);

        // Check if the player found the treasure
        if (newPosition == treasurePosition) {
            winner = msg.sender;
            uint256 prize = address(this).balance * 90 / 100;
            uint256 futureRounds = address(this).balance - prize;
            payable(msg.sender).transfer(prize);
            emit GameWon(msg.sender, prize);

            // Reset the treasure for the next round
            treasurePosition =  uint256(keccak256(abi.encodePacked(blockhash(block.number)))) % GRID_SIZE;
            payable(address(this)).transfer(futureRounds);
        } else {
            // Handle treasure movement based on the rules
            if (newPosition % 5 == 0) {
                treasurePosition = _moveTreasureAdjacent();
            } else if (_isPrime(newPosition)) {
                treasurePosition = _moveTreasureRandom();
            }

            emit TreasureMoved(treasurePosition);
        }
    }

    function _moveTreasureAdjacent() private view returns (uint256) {
        uint256[] memory adjacentPositions = _getAdjacentPositions(treasurePosition);
        return adjacentPositions[uint256(keccak256(abi.encodePacked(block.timestamp))) % adjacentPositions.length];
    }

    function _moveTreasureRandom() private view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao))) % GRID_SIZE;
    }

    function _getAdjacentPositions(uint256 position) private pure returns (uint256[] memory) {
    uint256 count = 0;
    
    // First, count the number of valid adjacent positions
    if (position >= 10) count++; // Up
    if (position < GRID_SIZE - 10) count++; // Down
    if (position % 10 != 0) count++; // Left
    if ((position + 1) % 10 != 0) count++; // Right

    // Create an array with the correct size
    uint256[] memory adjacent = new uint256[](count);
    count = 0;

    // Now populate the adjacent positions
    if (position >= 10) adjacent[count++] = position - 10; // Up
    if (position < GRID_SIZE - 10) adjacent[count++] = position + 10; // Down
    if (position % 10 != 0) adjacent[count++] = position - 1; // Left
    if ((position + 1) % 10 != 0) adjacent[count++] = position + 1; // Right

    return adjacent;
}

    function _isPrime(uint256 num) private pure returns (bool) {
        if (num < 2) return false;
        for (uint256 i = 2; i * i <= num; i++) {
            if (num % i == 0) return false;
        }
        return true;
    }
}
