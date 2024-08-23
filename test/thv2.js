const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("TreasureHunt", function () {

  // Fixture to deploy the TreasureHunt contract
  async function deployTreasureHuntFixture() {
    const [owner, player1, player2] = await ethers.getSigners();
    const TreasureHunt = await ethers.getContractFactory("TreasureHunt");
    const treasureHunt = await TreasureHunt.deploy();

    console.log("Deployed address", treasureHunt.target);

    return { treasureHunt, owner, player1, player2 };
  }

  describe("Deployment", function () {

    // Test that the grid size is correctly set
    it("Should set the correct grid size", async function () {
      const { treasureHunt } = await loadFixture(deployTreasureHuntFixture);
      const gridSize = await treasureHunt.GRID_SIZE(); 
      expect(gridSize.toString()).to.equal("10");  // GRID_SIZE is 10
    });
    
    // Test that the winner is initially the null address
    it("Should set the winner to the null address", async function () {
      const { treasureHunt } = await loadFixture(deployTreasureHuntFixture);
      const winnerAddress = await treasureHunt.winner();
      expect(winnerAddress).to.equal("0x0000000000000000000000000000000000000000");
    });

    // Test that the initial treasure position is set
    it("Should set initial treasure position", async function () {
      const { treasureHunt } = await loadFixture(deployTreasureHuntFixture);
      expect(await treasureHunt.treasurePosition()).to.be.lt(100);  // Total cells is 100
    });
  });

  describe("Game Mechanics", function () {

    // Test that a player can move
    it("Should allow a player to move", async function () {
      const { treasureHunt, player1 } = await loadFixture(deployTreasureHuntFixture);
      await expect(treasureHunt.connect(player1).move(1, { value: ethers.parseEther("1.0") }))
        .to.emit(treasureHunt, "PlayerMoved")
        .withArgs(player1.address, 1);
    });

    // Test that the move is reverted if no ether is sent
    it("Should revert if insufficient ether is sent", async function () {
      const { treasureHunt, player1 } = await loadFixture(deployTreasureHuntFixture);
      await expect(treasureHunt.connect(player1).move(1, { value: ethers.parseEther("0") }))
        .to.be.revertedWith("Must send ETH to participate.");
    });

    // Test that the move is reverted for invalid positions
    it("Should revert if move is to an invalid position", async function () {
      const { treasureHunt, player1 } = await loadFixture(deployTreasureHuntFixture);
      await expect(treasureHunt.connect(player1).move(101, { value: ethers.parseEther("1.0") }))
        .to.be.revertedWith("Invalid move.");
    });

    // Test that a player cannot move twice in the same round
    it("Should not allow a player to move twice in the same round", async function () {
      const { treasureHunt, player1 } = await loadFixture(deployTreasureHuntFixture);

      // First move: this should work fine
      await treasureHunt.connect(player1).move(1, { value: ethers.parseEther("1.0") });

      // Second move attempt: this should fail as it's the same turn
      await expect(treasureHunt.connect(player1).move(2, { value: ethers.parseEther("1.0") }))
        .to.be.revertedWith("Player has already moved this round.");
    });

    // Test that the treasure position is updated when a player moves to a multiple of 5
    it("Should update treasure position when player moves to a multiple of 5", async function () {
      const { treasureHunt, player1 } = await loadFixture(deployTreasureHuntFixture);
      const initialPosition = await treasureHunt.treasurePosition();
      await treasureHunt.connect(player1).move(5, { value: ethers.parseEther("1.0") });
      expect(await treasureHunt.treasurePosition()).to.not.equal(initialPosition);
    });

    // Test that the game is won when the player finds the treasure
    it("Should emit GameWon event when player finds the treasure", async function () {
      const { treasureHunt, player1 } = await loadFixture(deployTreasureHuntFixture);
      const treasurePosition = await treasureHunt.treasurePosition();
      await expect(treasureHunt.connect(player1).move(treasurePosition, { value: ethers.parseEther("1.0") }))
        .to.emit(treasureHunt, "GameWon")
        .withArgs(player1.address, anyValue);  // anyValue because the prize value varies
    });
  });
});
