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

    await tribeDapp
      .connect(otherAccount)
      .createTribe(priceToJoin, maxCapacity, uri, {
        value: priceNewTribe,
      });

    const id = await tribeDapp.connect(otherAccount).getMaxId();

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
    it("Should set the right priceNewTribe", async function () {
      const { tribeDapp, priceNewTribe } = await loadFixture(deployContract);

      expect(await tribeDapp.getPriceNewTribe()).to.equal(priceNewTribe);
    });

    it("Should set the right owner", async function () {
      const { tribeDapp, owner } = await loadFixture(deployContract);

      expect(await tribeDapp.owner()).to.equal(owner.address);
    });

    it("Cannot edit a non owner the priceNewTribe", async function () {
      const { tribeDapp, otherAccount } = await loadFixture(deployContract);
      const newPriceNewTribe = ethers.parseEther("0.1");

      await expect(
        tribeDapp.connect(otherAccount).setPriceNewTribe(newPriceNewTribe)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Owner can update the priceNewTribe", async function () {
      const { tribeDapp, owner } = await loadFixture(deployContract);

      const newPriceNewTribe = ethers.parseEther("0.1");

      await tribeDapp.connect(owner).setPriceNewTribe(newPriceNewTribe);

      expect(await tribeDapp.connect(owner).getPriceNewTribe()).to.equal(
        newPriceNewTribe
      );
    });
  });

  describe("Tribe Setup", function () {
    it("Should fail to create a new Tribe (wrong payment)", async function () {
      const { tribeDapp, priceNewTribe, otherAccount } = await loadFixture(
        deployContract
      );
      const priceToJoin = ethers.parseEther("1");
      const maxCapacity = 10;
      const uri = "www.google.com";

      await expect(
        tribeDapp
          .connect(otherAccount)
          .createTribe(priceToJoin, maxCapacity, uri)
      ).to.be.revertedWithCustomError(tribeDapp, "TribeDappWrongPayment");
    });

    it("Should be empty tribe", async function () {
      const { tribeDapp, otherAccount } = await loadFixture(deployContract);

      await expect(tribeDapp.connect(otherAccount).getTribe(10)).to.be.reverted;
    });

    it("Should create a new tribe correctly", async function () {
      const {
        tribeDapp,
        id,
        priceToJoin,
        maxCapacity,
        capacity,
        uri,
        otherAccount,
      } = await loadFixture(createTribe);

      const returnedValues = await tribeDapp.connect(otherAccount).getTribe(id);

      expect(returnedValues[0]).to.equal(otherAccount.address);
      expect(returnedValues[1]).to.equal(priceToJoin);
      expect(returnedValues[2]).to.equal(maxCapacity);
      expect(returnedValues[3]).to.equal(0);
      expect(returnedValues[4]).to.equal(uri);
    });

    it("Should not be able to delete a tribe anyone", async function () {
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
    });

    it("Should delete and create new tribes", async function () {
      const {
        tribeDapp,
        id,
        priceToJoin,
        maxCapacity,
        capacity,
        uri,
        otherAccount,
      } = await loadFixture(createTribe);

      await tribeDapp.connect(otherAccount).deleteTribe(id);

      await expect(tribeDapp.connect(otherAccount).getTribe(id)).to.be.reverted;

      const priceNewTribe = await tribeDapp
        .connect(otherAccount)
        .getPriceNewTribe();

      await tribeDapp
        .connect(otherAccount)
        .createTribe(priceToJoin, maxCapacity, uri, {
          value: priceNewTribe,
        });
      const id2 = await tribeDapp.connect(otherAccount).getMaxId();

      expect(Number(id)).not.to.equal(Number(id2));
    });
  });
});
