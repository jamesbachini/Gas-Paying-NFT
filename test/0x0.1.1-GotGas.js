const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

/*
  Note requires a mainnet fork to interact with lido/curve
  npx hardhat node --fork https://eth-mainnet.alchemyapi.io/v2/YOURAPIKEY
*/

describe("GotGas", function () {

  describe("Deployment", function () {
    it("Should deploy correctly", async function () {
      const GG = await hre.ethers.getContractFactory("GotGas");
      const gg = await GG.deploy();
      await gg.deployed();
      expect(await gg.name()).to.equal('GotGas');
    });

  });
});
