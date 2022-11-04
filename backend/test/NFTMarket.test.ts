import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("NFTMarket", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployNFTMarket() {
    const Market = await ethers.getContractFactory("NFTMarket")
    const market = await Market.deploy()
    // deploy NFTMarket.sol
    await market.deployed()
    // reference NFTMarket.sol address
    const marketAddress = market.address
    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(marketAddress);
    const nftAddress = nft.address;
    return { market, nft, marketAddress, nftAddress };
  }

  describe("Deployment", function () {
    it("should create two token", async () => {
      const { nft, market, nftAddress } = await loadFixture(deployNFTMarket);
      const auctionPrice = ethers.utils.parseUnits('1', 'ether');
      const [_, creatorAddress, buyerAddress] = await ethers.getSigners();

      await nft.createToken("https://www.mytokenlocation.com");
      await nft.createToken("https://www.mytokenlocation2.com");

      await market.createMarketItem(nftAddress, 1, auctionPrice, creatorAddress.getAddress(), 10);
      await market.createMarketItem(nftAddress, 2, auctionPrice, creatorAddress.getAddress(), 10);
    
      const items = await market.fetchMarketItems();
      expect(items.length).equal(2);
    });

  });
});