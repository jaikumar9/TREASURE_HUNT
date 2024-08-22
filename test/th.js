const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("TreasureHunt", function () {
  async function deployTreasureHuntFixture() {
    const [owner, player1, player2] = await ethers.getSigners();
    const TreasureHunt = await ethers.getContractFactory("TreasureHunt");
    const treasureHunt = await TreasureHunt.deploy();

    console.log("Deployed address", treasureHunt.target);
    // console.log("Contract console", treasureHunt)

    return { treasureHunt, owner, player1, player2 };
  }

  describe("Deployment", function () {
    it("Should set the correct grid size", async function () {
        const { treasureHunt } = await loadFixture(deployTreasureHuntFixture);
        // Accessing a constant variable directly from the contract
        const gridSize = await treasureHunt.GRID_SIZE(); 
        expect(gridSize.toString()).to.equal("100");
      });

      
    it("Should set initial treasure position", async function () {
      const { treasureHunt } = await loadFixture(deployTreasureHuntFixture);
      expect(await treasureHunt.treasurePosition()).to.be.lt(100);
    });
  });

  describe("Game Mechanics", function () {
    it("Should allow a player to move", async function () {
      const { treasureHunt, player1 } = await loadFixture(deployTreasureHuntFixture);
      await expect(treasureHunt.connect(player1).move(1, { value: ethers.parseEther("0.01") }))
        .to.emit(treasureHunt, "PlayerMoved")
        .withArgs(player1.address, 1);
    });
});

//     it("Should revert if insufficient ether is sent", async function () {
//       const { treasureHunt, player1 } = await loadFixture(deployTreasureHuntFixture);
//       await expect(treasureHunt.connect(player1).move(1, { value: ethers.utils.parseEther("0.009") }))
//         .to.be.revertedWithCustomError(treasureHunt, "InsufficientEtherSent");
//     });

//     it("Should revert if move is invalid", async function () {
//       const { treasureHunt, player1 } = await loadFixture(deployTreasureHuntFixture);
//       await treasureHunt.connect(player1).move(1, { value: ethers.utils.parseEther("0.01") });
//       await expect(treasureHunt.connect(player1).move(3, { value: ethers.utils.parseEther("0.01") }))
//         .to.be.revertedWithCustomError(treasureHunt, "InvalidMove");
//     });

//     it("Should update treasure position when player moves to multiple of 5", async function () {
//       const { treasureHunt, player1 } = await loadFixture(deployTreasureHuntFixture);
//       const initialPosition = await treasureHunt.treasurePosition();
//       await treasureHunt.connect(player1).move(5, { value: ethers.utils.parseEther("0.01") });
//       expect(await treasureHunt.treasurePosition()).to.not.equal(initialPosition);
//     });

//     it("Should emit GameWon event when player finds the treasure", async function () {
//       const { treasureHunt, player1 } = await loadFixture(deployTreasureHuntFixture);
//       const treasurePosition = await treasureHunt.treasurePosition();
//       await expect(treasureHunt.connect(player1).move(treasurePosition, { value: ethers.utils.parseEther("0.01") }))
//         .to.emit(treasureHunt, "GameWon")
//         .withArgs(player1.address, anyValue);
//     });
//   });
});