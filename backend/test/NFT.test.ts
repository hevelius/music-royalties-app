import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
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

  it("should support the ERC721 and ERC4907 standards", async () => {
    const { nft } = await loadFixture(deployNFT);
    const ERC721InterfaceId = "0x80ac58cd";
    const ERC4907InterfaceId = "0xad092b5c";
    var isERC721 = await nft.supportsInterface(ERC721InterfaceId);
    var isER4907 = await nft.supportsInterface(ERC4907InterfaceId); 
    expect(isERC721).equal(true, "RentablePets is not an ERC721");
    expect(isER4907).equal(true, "RentablePets is not an ERC4907");
  });

  it("should returns right name and symbol", async () => {
    const { nft } = await loadFixture(deployNFT);
    expect(await nft.name()).to.equal("MusicRoyalties");
    expect(await nft.symbol()).to.equal("MRY");    
  });
    
});