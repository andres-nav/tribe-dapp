import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("TribeDapp", function () {
  async function deployContract() {
    const priceNewTribe = ethers.parseEther("0.01");

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const TribeDapp = await ethers.getContractFactory("TribeDapp");
    const tribeDapp = await TribeDapp.deploy(priceNewTribe);

    return { tribeDapp, priceNewTribe, owner, otherAccount };
  }

  async function createTribe() {
    const { tribeDapp, priceNewTribe, owner, otherAccount } = await loadFixture(
      deployContract
    );

    const priceToJoin = ethers.parseEther("1");
    const maxCapacity = 10;
    const uri = "www.google.com";

    const tx = await tribeDapp
      .connect(otherAccount)
      .createTribe(priceToJoin, maxCapacity, uri, {
        value: priceNewTribe,
      });

    const id = (
      await network.provider.send("debug_traceTransaction", [tx.hash])
    ).returnValue;

    return {
      tribeDapp,
      id,
      priceToJoin,
      maxCapacity,
      uri,
      owner,
      otherAccount,
    };
  }
  describe("Deployment", function () {
    it("constructor", async function () {
      const { tribeDapp, priceNewTribe, owner } = await loadFixture(
        deployContract
      );

      // Check if the values are set up correctly
      expect(await tribeDapp.getPriceNewTribe()).to.equal(priceNewTribe);
      expect(await tribeDapp.getMaxId()).to.equal(0);
      expect(await tribeDapp.owner()).to.equal(owner.address);
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

      await tribeDapp.connect(owner).setPriceNewTribe(newPriceNewTribe);

      expect(await tribeDapp.connect(owner).getPriceNewTribe()).to.equal(
        newPriceNewTribe
      );
    });
  });

  describe("Setup", function () {
    it("getTribe", async function () {
      const { tribeDapp, otherAccount } = await loadFixture(deployContract);

      // Check if getting a tribe that does not exist
      await expect(
        tribeDapp.connect(otherAccount).getTribe(10)
      ).to.be.revertedWithCustomError(tribeDapp, "TribeDoesNotExist");
    });
    it("createTribe", async function () {
      const { tribeDapp, priceNewTribe, owner, otherAccount } =
        await loadFixture(deployContract);

      const priceToJoin = ethers.parseEther("1");
      const maxCapacity = 10;
      const uri = "www.google.com";

      // Check if no payment
      await expect(
        tribeDapp
          .connect(otherAccount)
          .createTribe(priceToJoin, maxCapacity, uri)
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

      // TODO: Check if the balanceContract has been updated
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

      await expect(tribeDapp.connect(owner).deleteTribe(id)).to.be.reverted;
      await expect(tribeDapp.connect(owner).setOwnershipToTribe(id, owner)).to
        .be.reverted;
      await expect(tribeDapp.connect(owner).setPriceToJoinToTribe(id, 0)).to.be
        .reverted;
      await expect(tribeDapp.connect(owner).setMaxCapacityToTribe(id, 0)).to.be
        .reverted;
      await expect(tribeDapp.connect(owner).setUriToTribe(id, "")).to.be
        .reverted;
    });

    it("onlyTribeOnwer", async function () {
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

      await expect(tribeDapp.connect(owner).deleteTribe(id)).to.be.reverted;
      await expect(tribeDapp.connect(owner).setOwnershipToTribe(id, owner)).to
        .be.reverted;
      await expect(tribeDapp.connect(owner).setPriceToJoinToTribe(id, 0)).to.be
        .reverted;
      await expect(tribeDapp.connect(owner).setMaxCapacityToTribe(id, 0)).to.be
        .reverted;
      await expect(tribeDapp.connect(owner).setUriToTribe(id, "")).to.be
        .reverted;
    });

    it("setTribe functions", async function () {
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

      const newPriceToJoin = ethers.parseEther("2");
      const newMaxCapacity = 100;
      const newUri = "www.duckduckgo.com";

      await tribeDapp.connect(otherAccount).setOwnershipToTribe(id, owner);
      await expect(
        tribeDapp.connect(otherAccount).setOwnershipToTribe(id, otherAccount)
      ).to.be.reverted;

      await tribeDapp.connect(owner).setPriceToJoinToTribe(id, newPriceToJoin);
      await tribeDapp.connect(owner).setMaxCapacityToTribe(id, newMaxCapacity);
      await tribeDapp.connect(owner).setUriToTribe(id, newUri);

      const returnedValues = await tribeDapp.connect(otherAccount).getTribe(id);

      expect(returnedValues[0]).to.equal(owner.address);
      expect(returnedValues[1]).to.equal(newPriceToJoin);
      expect(Number(returnedValues[2])).to.equal(newMaxCapacity);
      expect(returnedValues[4]).to.equal(newUri);
    });
  });

  //tests for capacity

  describe("ERC1155 functions", function () {}); // test for all public functions

  describe("Functionality", function () {
    it("mint", async function () {
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

      // Check payment
      await expect(
        tribeDapp.connect(otherAccount).mint(id)
      ).to.be.revertedWithCustomError(tribeDapp, "TribeDappWrongPayment");

      // Check that it can only mint one
      await tribeDapp.connect(otherAccount).mint(id, { value: priceToJoin });
      await expect(
        tribeDapp.connect(otherAccount).mint(id, { value: priceToJoin })
      ).to.be.reverted;

      // check that it can only mint from tribes that exist
      await expect(
        tribeDapp.connect(otherAccount).mint(10, { value: priceToJoin })
      ).to.be.reverted;

      // check that can only mint if there is available capacity
      await tribeDapp.connect(otherAccount).setMaxCapacityToTribe(id, 1);
      await expect(
        tribeDapp.connect(owner).mint(id, { value: priceToJoin })
      ).to.be.revertedWithCustomError(tribeDapp, "TribeDappTribeFull");
    });
  });
});
