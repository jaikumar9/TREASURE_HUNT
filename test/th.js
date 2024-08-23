// const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
// const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
// const { expect } = require("chai");

// describe("TreasureHunt", function () {
//   async function deployTreasureHuntFixture() {
//     const [owner, player1, player2] = await ethers.getSigners();
//     const TreasureHunt = await ethers.getContractFactory("TreasureHunt");
//     const treasureHunt = await TreasureHunt.deploy();

//     console.log("Deployed address", treasureHunt.target);
//     // console.log("Contract console", treasureHunt)

//     return { treasureHunt, owner, player1, player2 };
//   }

//   describe("Deployment", function () {

//     // Global variables tests
//     it("Should set the correct grid size", async function () {
//         const { treasureHunt } = await loadFixture(deployTreasureHuntFixture);
//         // Accessing a constant variable directly from the contract
//         const gridSize = await treasureHunt.GRID_SIZE(); 
//         expect(gridSize.toString()).to.equal("100");
//       });
      
//       it("Should set the winner to the null address", async function () {
//         const { treasureHunt } = await loadFixture(deployTreasureHuntFixture);
//         const winnerAddress = await treasureHunt.winner();
//         expect(winnerAddress).to.equal("0x0000000000000000000000000000000000000000");
//       });
      
//     it("Should set initial treasure position", async function () {
//       const { treasureHunt } = await loadFixture(deployTreasureHuntFixture);
//       expect(await treasureHunt.treasurePosition()).to.be.lt(100);
//     });
//   });
  

//   describe("Game Mechanics", function () {
//     it("Should allow a player to move", async function () {
//       const { treasureHunt, player1 } = await loadFixture(deployTreasureHuntFixture);
//       await expect(treasureHunt.connect(player1).movePlayer(1, { value: ethers.parseEther("1.0") }))
//         .to.emit(treasureHunt, "PlayerMoved")
//         .withArgs(player1.address, 1);
//     });

//     it("Should revert if insufficient ether is sent", async function () {
//       const { treasureHunt, player1 } = await loadFixture(deployTreasureHuntFixture);
    
//       await expect(treasureHunt.connect(player1).movePlayer(1, { value: ethers.parseEther("0") }))
//         .to.be.revertedWith("You must send ETH to move.");
//     });
    
//     it("Should revert if Invalid position. ",async function () {
//       const { treasureHunt, player1 } = await loadFixture(deployTreasureHuntFixture);
//       await expect(treasureHunt.connect(player1).movePlayer(101, { value: ethers.parseEther("1.0") }))
//       .to.be.revertedWith("Invalid position.");
//     });


//     it("Should not allow a player to move twice in the same turn", async function () {
//       const { treasureHunt, player1 } = await loadFixture(deployTreasureHuntFixture);
  
//       // First move: this should work fine
//       await treasureHunt.connect(player1).movePlayer(1, { value: ethers.parseEther("1.0") });
  
//       // Second move attempt: this should fail as it's the same turn
//       await expect(
//           treasureHunt.connect(player1).movePlayer(2, { value: ethers.parseEther("1.0") })
//       ).to.be.revertedWith("You can only move once per turn.");
//   });
// });


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




// });