import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

import { deployContract, createTribe } from "../scripts/basicFunctions";

describe("Deployment", function () {
  it("constructor", async function () {
    const { tribeDapp, priceNewTribe, feeIn100, owner, otherAccount } =
      await loadFixture(deployContract);

    // Check if the values are set up correctly
    expect(await tribeDapp.getMaxId()).to.equal(0);
    expect(await tribeDapp.getPriceNewTribe()).to.equal(priceNewTribe);
    expect(await tribeDapp.getFeeIn100()).to.equal(feeIn100);
    expect(await tribeDapp.getBalanceContract()).to.equal(0);
    expect(await tribeDapp.owner()).to.equal(owner.address);
    expect(await tribeDapp.owner()).not.to.equal(otherAccount.address);
  });

  it("setPriceNewTribe", async function () {
    const { tribeDapp, owner, otherAccount } = await loadFixture(
      deployContract
    );
    const newPriceNewTribe = ethers.parseEther("0.1");

    // Check if non owner can change the price
    await expect(
      tribeDapp.connect(otherAccount).setPriceNewTribe(newPriceNewTribe)
    ).to.be.revertedWith("Ownable: caller is not the owner");

    // Check if the new price changes
    await tribeDapp.connect(owner).setPriceNewTribe(newPriceNewTribe);

    expect(await tribeDapp.connect(owner).getPriceNewTribe()).to.equal(
      newPriceNewTribe
    );
  });

  it("setFeeIn100", async function () {
    const { tribeDapp, owner, otherAccount } = await loadFixture(
      deployContract
    );
    const newFeeIn100 = 50;

    // Check if non owner can change the price
    await expect(
      tribeDapp.connect(otherAccount).setFeeIn100(newFeeIn100)
    ).to.be.revertedWith("Ownable: caller is not the owner");

    // Check if the limit is 100

    await expect(
      tribeDapp.connect(owner).setFeeIn100(101)
    ).to.be.revertedWithCustomError(tribeDapp, "WrongFee");

    // Check if the fee changes
    await tribeDapp.connect(owner).setFeeIn100(newFeeIn100);

    expect(await tribeDapp.connect(owner).getFeeIn100()).to.equal(newFeeIn100);
  });

  it("getBalanceContract", async function () {
    const { tribeDapp, owner, otherAccount } = await loadFixture(
      deployContract
    );

    await expect(
      tribeDapp.connect(otherAccount).getBalanceContract()
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });
});
