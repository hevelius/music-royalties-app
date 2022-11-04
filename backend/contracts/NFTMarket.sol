// contracts/NFTMarket.sol
// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * A contract that manages the sale of NFTs.
 */
contract NFTMarket is ReentrancyGuard {
  using SafeMath for uint256;
  using Counters for Counters.Counter;
  Counters.Counter private _itemIds;
  Counters.Counter private _itemsSold;
  Counters.Counter private _mintedItemIds;

  address payable owner;

  constructor() {
    owner = payable(msg.sender);
  }

  struct MarketItem {
    uint itemId;
    address nftContract;
    uint256 tokenId;
    address payable seller;
    address payable owner;
    address payable creator;
    uint256 price;
    uint256 royaltyPercent;
    bool sold;
  }
  mapping(uint256 => MarketItem) private idToMarketItem;
  event MarketItemCreated (
    uint indexed itemId,
    address indexed nftContract,
    uint256 indexed tokenId,
    address seller,
    address owner,
    address creator,
    uint256 price,
    uint256 royaltyPercent,
    bool sold
  );

  struct PersonalItem {
    uint itemId;
    address nftContract;
    uint256 tokenId;
    address payable owner;
  }

  mapping(uint256 => PersonalItem) private idToPersonalItem;


  /**
   * Creates a new market item.
   */
  function createMarketItem(address nftContract, uint256 tokenId, uint256 price, address creator, uint256 royaltyPercent) public payable nonReentrant {
    require(price > 0, "Price must be at least 1 wei");

    _itemIds.increment();
    uint256 itemId = _itemIds.current();

    idToMarketItem[itemId] =  MarketItem(
      itemId,
      nftContract,
      tokenId,
      payable(msg.sender),
      payable(address(0)),
      payable(creator),
      price,
      royaltyPercent,
      false
    );
    // Transfer the NFT to this contract.
    IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

    emit MarketItemCreated(itemId,nftContract,tokenId,msg.sender,address(0),creator,price,royaltyPercent,false);
  }

  /**
   * Creates a sale for this contract.
   */
  function createMarketSale(address nftContract, uint256 itemId) public payable nonReentrant {
    uint price = idToMarketItem[itemId].price;
    uint tokenId = idToMarketItem[itemId].tokenId;
    require(msg.value == price, "Please submit the asking price in order to complete the purchase");
    uint256 royaltyAmount = (idToMarketItem[itemId].royaltyPercent * price).div(100);

    // transfer the NFT to the buyer.
    idToMarketItem[itemId].seller.transfer(msg.value-royaltyAmount);
    idToMarketItem[itemId].creator.transfer(royaltyAmount);
    IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);

    // update the market item. 
    idToMarketItem[itemId].owner = payable(msg.sender);
    idToMarketItem[itemId].sold = true;
    _itemsSold.increment();
  }

  /**
   * Returns all unsold market items.
   */
  function fetchMarketItems() public view returns (MarketItem[] memory) {
    uint itemCount = _itemIds.current();
    uint unsoldItemCount = _itemIds.current() - _itemsSold.current();
    uint currentIndex = 0;

    MarketItem[] memory items = new MarketItem[](unsoldItemCount);
    for (uint i = 0; i < itemCount; i++) {
      if (idToMarketItem[i + 1].owner == address(0)) {
        uint currentId = i + 1;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }

  /**
   * Returns only items that a user has purchased.
   */
  function fetchMyNFTs() public view returns (MarketItem[] memory) {
    uint totalItemCount = _itemIds.current();
    uint itemCount = 0;
    uint currentIndex = 0;

    for (uint i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].owner == msg.sender) {
        itemCount += 1;
      }
    }

    MarketItem[] memory items = new MarketItem[](itemCount);
    for (uint i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].owner == msg.sender || idToPersonalItem[i + 1].owner == msg.sender) {
        uint currentId = i + 1;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }

  /**
   * Returns only items a user has created.
   */
  function fetchItemsCreated() public view returns (MarketItem[] memory) {
    uint totalItemCount = _itemIds.current();
    uint itemCount = 0;
    uint currentIndex = 0;

    for (uint i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].seller == msg.sender) {
        itemCount += 1;
      }
    }

    MarketItem[] memory items = new MarketItem[](itemCount);
    for (uint i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].seller == msg.sender) {
        uint currentId = i + 1;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }
  
}