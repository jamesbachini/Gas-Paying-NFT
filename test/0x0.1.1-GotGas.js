const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const IERC20 = "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20";

/*
  Note requires a mainnet fork to interact with lido/curve
  npx hardhat node --fork https://eth-mainnet.alchemyapi.io/v2/YOURAPIKEY
*/

describe("GotGas", function () {
  let gg,stEth,owner,user1,oneETH;
  

  it("Deployment", async function () {
    [owner,user1] = await ethers.getSigners();
    oneETH = ethers.utils.parseEther('1');
    const GG = await hre.ethers.getContractFactory("GotGas");
    gg = await GG.deploy();
    await gg.deployed();
    expect(await gg.name()).to.equal('GotGas');
  });

  it("SetUp stETH", async function () {
    const stEthAddress = await gg.stETH();
    expect(stEthAddress).to.equal('0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84');
    stEth = await hre.ethers.getContractAt(IERC20, stEthAddress);
  });

  it("Mint", async function () {
    await gg.mint(owner.address, {value: oneETH});
    expect(await gg.ownerOf(1)).to.equal(owner.address);
  });

  it("Check stETH Balance", async function () {
    const balance = await stEth.balanceOf(gg.address);
    expect(balance).to.gt(0);
  });

  it("Mint 99", async function () {
    for (let i = 2; i <= 100; i++) {
      await gg.connect(user1).mint(user1.address, {value: oneETH});
    }
    expect(await gg.ownerOf(2)).to.equal(user1.address);
    expect(await gg.ownerOf(99)).to.equal(user1.address);
  });

  it("Mint Too Many", async function () {
    await expect(gg.connect(owner).mint(owner.address, {value: oneETH})).to.be.reverted;
  });

  it("Manipulate stETH Balance", async function () {
    const balance1 = await stEth.balanceOf(gg.address);
    const whaleAddress = "0x176F3DAb24a159341c0509bB36B833E7fdd0a132";
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [whaleAddress],
    });
    const whale = await ethers.getSigner(whaleAddress);
    const tenETH = ethers.utils.parseEther('10');
    await stEth.connect(whale).transfer(gg.address, tenETH);
    //await ethers.provider.send("evm_mine", []);
    const balance2 = await stEth.balanceOf(gg.address);
    expect(balance2).to.gt(balance1);
  });

  it("Distribute", async function () {
    const ethBalance1 = await ethers.provider.getBalance(user1.address);
    await gg.distribute();
    const ethBalance2 = await ethers.provider.getBalance(user1.address);
    expect(ethBalance2).to.gt(ethBalance1);
  });

  it("Burn", async function () {
    const balance1 = await stEth.balanceOf(user1.address);
    await gg.connect(user1).burn(5);
    const balance2 = await stEth.balanceOf(user1.address);
    expect(balance2).to.gt(balance1);
  });

});
