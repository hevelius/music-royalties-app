import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("NFT", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployNFT() {
    const [marketAddress] = await ethers.getSigners();
    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(marketAddress.getAddress());
    return { nft };
  }

  describe("Deployment", function () {
    it("should returns right name and symbol", async () => {
      const { nft } = await loadFixture(deployNFT);
      expect(await nft.name()).to.equal("musicroyalties");
      expect(await nft.symbol()).to.equal("MRY");    })
  });
});