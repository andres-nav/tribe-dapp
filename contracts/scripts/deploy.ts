import { ethers } from "hardhat";

async function main() {
  const priceNewTribe = ethers.parseEther("0.01");
  const feeIn100 = 10;

  const tribeDapp = await ethers.deployContract("TribeDapp", [
    priceNewTribe,
    feeIn100,
  ]);

  await tribeDapp.waitForDeployment();

  console.log("deployed");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
