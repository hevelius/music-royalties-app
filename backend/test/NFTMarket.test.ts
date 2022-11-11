import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
const { constants, expectEvent } = require("@openzeppelin/test-helpers");

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
    
      const items = await market.fetchMarketItems(nftAddress);
      expect(items.length).equal(2);
    });

    it("should set UserInfo during market sell", async () => {
      const { nft, market, nftAddress, marketAddress } = await loadFixture(deployNFTMarket);
      const [one, two, three, creatorAddress] = await ethers.getSigners();

      const expirationDatePast = 1660252958; // Aug 8 2022
      const auctionPrice = ethers.utils.parseUnits('1', 'ether');
      await nft.createToken("https://www.mytokenlocation.com");
      await market.createMarketItem(nftAddress, 1, auctionPrice, creatorAddress.getAddress(), 10);
      const results = await market.createMarketSale(nftAddress, 1, { value: auctionPrice });
      //console.log(await market.getUserExpiration(nftAddress, 1));
      // Failed require in function
      //await expect(nft.setUser(1, creatorAddress.getAddress(), expirationDatePast, {from: marketAddress})).to.be.revertedWith("ERC721: transfer caller is not owner nor approved");
      // Assert no UserInfo for NFT
      const user = await nft.userOf(1);
      const date = await nft.userExpires(1);
      expect(user).equal(results.from, "NFT user is not nft address");
      expect(date).not.equal(0, "NFT expiration date is not 0");
    });
  
    it("should return the correct UserInfo", async () => {
      const { nft } = await loadFixture(deployNFTMarket);
      const expirationDatePast = 1660252958; // Aug 8 2022
      const expirationDateFuture = 4121727755; // Aug 11 2100
      await nft.createToken("fakeURI");
      await nft.createToken("fakeURI");
      const [marketAddress, creatorAddress, buyerAddress, anotherAddress] = await ethers.getSigners();
      // Set and get UserInfo
      var expiredTx = await nft.setUser(1, buyerAddress.getAddress(), expirationDatePast)
      var unexpiredTx = await nft.setUser(2, anotherAddress.getAddress(), expirationDateFuture)
      var expiredNFTUser = await nft.userOf(1);
      var expiredNFTDate = await nft.userExpires(1);
      var unexpireNFTUser = await nft.userOf(2);
      var unexpiredNFTDate = await nft.userExpires(2);
      // Assert UserInfo and event transmission
      expect(expiredNFTUser).equal(constants.ZERO_ADDRESS, "Expired NFT has wrong user");
      expect(expiredNFTDate).equal(expirationDatePast, "Expired NFT has wrong expiration date");
      //expectEvent(expiredTx, "UpdateUser", { tokenId: "1", user: buyerAddress.getAddress(), expires: expirationDatePast.toString()});
      //expect(unexpireNFTUser).equal(anotherAddress.getAddress(), "Expired NFT has wrong user");
      expect(unexpiredNFTDate).equal(expirationDateFuture, "Expired NFT has wrong expiration date");
      //expectEvent(unexpiredTx, "UpdateUser", { tokenId: "3", user: anotherAddress.getAddress(), expires: expirationDateFuture.toString()});
      // Burn NFT
      unexpiredTx = await nft.burn(2);
      // Assert UserInfo was deleted
      unexpireNFTUser = await nft.userOf(2);
      unexpiredNFTDate = await nft.userExpires(2);
      expect(unexpireNFTUser).equal(constants.ZERO_ADDRESS, "NFT user is not zero address");
      expect(unexpiredNFTDate).equal(0, "NFT expiration date is not 0");
      //expectEvent(unexpiredTx, "UpdateUser", { tokenId: "3", user: constants.ZERO_ADDRESS, expires: "0"});
    });

  });
});