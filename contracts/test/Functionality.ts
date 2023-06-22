import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

import { deployContract, createTribe } from "../scripts/basicFunctions";

describe("Functionality", function () {
  it("mint", async function () {
    const {
      tribeDapp,
      id,
      priceToJoin,
      priceNewTribe,
      uri,
      owner,
      otherAccount,
    } = await loadFixture(createTribe);

    // check that it can only mint from tribes that exist
    await expect(
      tribeDapp.connect(otherAccount).mint(10, { value: priceToJoin })
    ).to.be.revertedWithCustomError(tribeDapp, "TribeDoesNotExist");

    // Check payment
    await expect(
      tribeDapp.connect(otherAccount).mint(id)
    ).to.be.revertedWithCustomError(tribeDapp, "WrongPayment");

    // Check that it can only mint one
    await tribeDapp.connect(otherAccount).mint(id, { value: priceToJoin });
    await expect(
      tribeDapp.connect(otherAccount).mint(id, { value: priceToJoin })
    ).to.be.revertedWithCustomError(tribeDapp, "InTribe");

    // Check that capacity is updated
    const returnedValues = await tribeDapp.getTribe(id);
    expect(returnedValues[3]).to.equal(1);

    // check that can only mint if there is available capacity
    await tribeDapp.connect(otherAccount).updateTribe(id, priceToJoin, 1, uri);
    await expect(
      tribeDapp.connect(owner).mint(id, { value: priceToJoin })
    ).to.be.revertedWithCustomError(tribeDapp, "TribeFull");

    // check that the balances are updated
    const feeIn100 = await tribeDapp.getFeeIn100();
    const fee = (Number(priceToJoin) * Number(feeIn100)) / 100;

    expect(Number(returnedValues[5])).to.equal(
      Number(priceToJoin) - Number(fee)
    );

    expect(Number(await tribeDapp.getBalanceContract())).to.equal(
      Number(priceNewTribe) + Number(fee)
    );
  });

  it("burn", async function () {
    const {
      tribeDapp,
      id,
      priceToJoin,
      priceNewTribe,
      uri,
      owner,
      otherAccount,
    } = await loadFixture(createTribe);

    // check that it can only burn from tribes that exist
    await expect(
      tribeDapp.connect(otherAccount).burn(10)
    ).to.be.revertedWithCustomError(tribeDapp, "TribeDoesNotExist");

    // check that you cannot burn when you dont have
    await expect(tribeDapp.connect(otherAccount).burn(id)).to.be.revertedWith(
      "ERC1155: burn amount exceeds balance"
    );

    // Check that capacity is updated
    await tribeDapp.connect(otherAccount).mint(id, { value: priceToJoin });
    var returnedValues = await tribeDapp.getTribe(id);
    expect(returnedValues[3]).to.equal(1);
    await tribeDapp.connect(otherAccount).burn(id);
    returnedValues = await tribeDapp.getTribe(id);
    expect(returnedValues[3]).to.equal(0);
  });
});
