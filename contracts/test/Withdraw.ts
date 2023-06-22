import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

import { deployContract, createTribe } from "../scripts/basicFunctions";

describe("Withdraw", function () {
  it("withdraw", async function () {
    const { tribeDapp, owner, otherAccount } = await loadFixture(createTribe);

    // Check if non owner can withdraw
    await expect(tribeDapp.connect(otherAccount).withdraw()).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );

    // Check that _balanceContract is updated and the transfer is made
    const balanceContract = await tribeDapp.connect(owner).getBalanceContract();
    await tribeDapp.connect(owner).withdraw();

    expect(await tribeDapp.getBalanceContract()).to.equal(0);
  });

  it("withdrawTribe", async function () {
    const { tribeDapp, id, priceToJoin, owner, otherAccount } =
      await loadFixture(createTribe);

    // check that it can only withdraw from tribes that exist
    await expect(
      tribeDapp.connect(otherAccount).withdrawTribe(10)
    ).to.be.revertedWithCustomError(tribeDapp, "TribeDoesNotExist");

    // Check if non owner can withdraw
    await expect(
      tribeDapp.connect(owner).withdrawTribe(id)
    ).to.be.revertedWithCustomError(tribeDapp, "IsNotTribeOwner");

    // Check that balanceTribe is updated and the transfer is made
    await tribeDapp.connect(otherAccount).mint(id, { value: priceToJoin });
    await tribeDapp.connect(otherAccount).withdrawTribe(id);

    const returnedValues = await tribeDapp.getTribe(id);
    expect(returnedValues[5]).to.equal(0);
  });
});
