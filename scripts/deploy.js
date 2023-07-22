const hre = require("hardhat");

async function main() {
  const GG = await hre.ethers.getContractFactory("GotGas");
  const gg = await GG.deploy();
  await gg.deployed();
  console.log(`Deployed to ${gg.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
