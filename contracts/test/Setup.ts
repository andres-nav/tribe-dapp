import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";

import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

import { deployContract, createTribe } from "../scripts/basicFunctions";

describe("Setup", function () {
  it("getTribe", async function () {
    const { tribeDapp, otherAccount } = await loadFixture(deployContract);

    // Check if getting a tribe that does not exist
    await expect(
      tribeDapp.connect(otherAccount).getTribe(10)
    ).to.be.revertedWithCustomError(tribeDapp, "TribeDoesNotExist");
  });

  it("createTribe", async function () {
    const { tribeDapp, priceNewTribe, owner, otherAccount } = await loadFixture(
      deployContract
    );

    const priceToJoin = ethers.parseEther("1");
    const maxCapacity = 10;
    const uri = "www.google.com";

    // Check if no payment
    await expect(
      tribeDapp.connect(otherAccount).createTribe(priceToJoin, maxCapacity, uri)
    ).to.be.revertedWithCustomError(tribeDapp, "WrongPayment");

    // Check if wrong payment
    await expect(
      tribeDapp
        .connect(otherAccount)
        .createTribe(priceToJoin, maxCapacity, uri, { value: priceToJoin })
    ).to.be.revertedWithCustomError(tribeDapp, "WrongPayment");

    // Check if the values have been set up correctly
    const tx = await tribeDapp
      .connect(otherAccount)
      .createTribe(priceToJoin, maxCapacity, uri, { value: priceNewTribe });

    const id = (
      await network.provider.send("debug_traceTransaction", [tx.hash])
    ).returnValue;
    const returnedValues = await tribeDapp.connect(otherAccount).getTribe(id);

    expect(returnedValues[0]).to.equal(otherAccount.address);
    expect(returnedValues[1]).to.equal(priceToJoin);
    expect(returnedValues[2]).to.equal(maxCapacity);
    expect(returnedValues[3]).to.equal(0);
    expect(returnedValues[4]).to.equal(uri);
    expect(returnedValues[5]).to.equal(0);

    // Check if the maxId has been updated
    const maxId = await tribeDapp.connect(owner).getMaxId();
    await expect(maxId).to.equal(Number(id));

    // Check if the balanceContract has been updated
    await expect(await tribeDapp.connect(owner).getBalanceContract()).to.equal(
      priceNewTribe
    );
  });

  it("deleteTribe", async function () {
    const {
      tribeDapp,
      id,
      priceToJoin,
      maxCapacity,
      capacity,
      uri,
      owner,
      otherAccount,
    } = await loadFixture(createTribe);

    // check if can only change for tribes that exist
    await expect(
      tribeDapp.connect(otherAccount).deleteTribe(10)
    ).to.be.revertedWithCustomError(tribeDapp, "TribeDoesNotExist");

    // Check if non tribe owner can delete the tribe
    await expect(
      tribeDapp.connect(owner).deleteTribe(id)
    ).to.be.revertedWithCustomError(tribeDapp, "IsNotTribeOwner");

    // Check if it has been deleted
    await tribeDapp.connect(otherAccount).deleteTribe(id);

    await expect(
      tribeDapp.connect(otherAccount).getTribe(id)
    ).to.be.revertedWithCustomError(tribeDapp, "TribeDoesNotExist");

    // check if new tribes do not override the id of the deleted
    const priceNewTribe = await tribeDapp
      .connect(otherAccount)
      .getPriceNewTribe();

    const tx = await tribeDapp
      .connect(otherAccount)
      .createTribe(priceToJoin, maxCapacity, uri, {
        value: priceNewTribe,
      });

    const id2 = (
      await network.provider.send("debug_traceTransaction", [tx.hash])
    ).returnValue;

    expect(Number(id)).not.to.equal(Number(id2));
  });

  it("setOwnershipToTribe", async function () {
    const { tribeDapp, id, owner, otherAccount } = await loadFixture(
      createTribe
    );

    // check if can only change for tribes that exist
    await expect(
      tribeDapp.connect(otherAccount).setOwnershipToTribe(10, owner)
    ).to.be.revertedWithCustomError(tribeDapp, "TribeDoesNotExist");

    // check if non tribe owner can run
    await expect(
      tribeDapp.connect(owner).setOwnershipToTribe(id, owner)
    ).to.be.revertedWithCustomError(tribeDapp, "IsNotTribeOwner");

    // Check if can change ownership
    await tribeDapp.connect(otherAccount).setOwnershipToTribe(id, owner);

    await expect(
      tribeDapp.connect(otherAccount).setOwnershipToTribe(id, owner)
    ).to.be.revertedWithCustomError(tribeDapp, "IsNotTribeOwner");
  });

  it("updateTribe", async function () {
    const {
      tribeDapp,
      id,
      priceToJoin,
      maxCapacity,
      capacity,
      uri,
      owner,
      otherAccount,
    } = await loadFixture(createTribe);

    const newPriceToJoin = ethers.parseEther("0.1");
    const newMaxCapacity = 100;
    const newUri = "www.duckduckgo";

    // check if can only change for tribes that exist
    await expect(
      tribeDapp
        .connect(owner)
        .updateTribe(100, newPriceToJoin, newMaxCapacity, newUri)
    ).to.be.revertedWithCustomError(tribeDapp, "TribeDoesNotExist");

    // check if non tribe owner can run
    await expect(
      tribeDapp
        .connect(owner)
        .updateTribe(id, newPriceToJoin, newMaxCapacity, newUri)
    ).to.be.revertedWithCustomError(tribeDapp, "IsNotTribeOwner");

    // check if tribe is updated
    await tribeDapp
      .connect(otherAccount)
      .updateTribe(id, newPriceToJoin, newMaxCapacity, newUri);

    const returnedValues = await tribeDapp.connect(otherAccount).getTribe(id);

    expect(returnedValues[0]).to.equal(otherAccount.address);
    expect(returnedValues[1]).to.equal(newPriceToJoin);
    expect(Number(returnedValues[2])).to.equal(newMaxCapacity);
    expect(returnedValues[4]).to.equal(newUri);

    // check if newMaxCapacity is not smaller than capacity
    await tribeDapp.connect(owner).mint(id, { value: newPriceToJoin });

    await expect(
      tribeDapp.connect(otherAccount).updateTribe(id, newPriceToJoin, 0, newUri)
    ).to.be.revertedWithCustomError(tribeDapp, "MaxCapacitySmall");
  });
});
