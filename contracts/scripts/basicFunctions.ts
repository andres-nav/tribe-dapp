import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";

export async function deployContract() {
  const priceNewTribe = ethers.parseEther("0.01");
  const feeIn100 = 10;

  // Contracts are deployed using the first signer/account by default
  const [owner, otherAccount] = await ethers.getSigners();

  const provider = await ethers.getContractFactory("TribeDapp");
  const tribeDapp = await provider.deploy(priceNewTribe, feeIn100);

  return { provider, tribeDapp, priceNewTribe, feeIn100, owner, otherAccount };
}

export async function createTribe() {
  const { provider, tribeDapp, priceNewTribe, owner, otherAccount } =
    await loadFixture(deployContract);

  const priceToJoin = ethers.parseEther("1");
  const maxCapacity = 10;
  const uri = "www.google.com";

  const tx = await tribeDapp
    .connect(otherAccount)
    .createTribe(priceToJoin, maxCapacity, uri, {
      value: priceNewTribe,
    });

  const id = (await network.provider.send("debug_traceTransaction", [tx.hash]))
    .returnValue;

  return {
    provider,
    tribeDapp,
    id,
    priceToJoin,
    priceNewTribe,
    maxCapacity,
    uri,
    owner,
    otherAccount,
  };
}
