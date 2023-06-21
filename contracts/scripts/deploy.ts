import { ethers } from "hardhat";

async function main() {
  const priceNewTribe = ethers.parseEther("0.01");

  const tribeDapp = await ethers.deployContract("TribeDapp", [priceNewTribe]);

  await tribeDapp.waitForDeployment();

  console.log("deployed");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
