// contracts/NFTMarket.sol
// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./IERC4907.sol";

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
        address payable creator;
        uint256 price;
        uint256 royaltyPercent;
    }
    mapping(uint256 => MarketItem) private idToMarketItem;
    event MarketItemCreated(
        uint indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address creator,
        uint256 price,
        uint256 royaltyPercent
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
    function createMarketItem(
        address nftContract,
        uint256 tokenId,
        uint256 price,
        address creator,
        uint256 royaltyPercent
    ) public payable nonReentrant {
        require(price > 0, "Price must be at least 1 wei");

        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        idToMarketItem[itemId] = MarketItem(
            itemId,
            nftContract,
            tokenId,
            payable(creator),
            price,
            royaltyPercent
        );

        // Transfer the NFT to this contract.
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        emit MarketItemCreated(
            itemId,
            nftContract,
            tokenId,
            creator,
            price,
            royaltyPercent
        );
    }

    /**
     * Creates a sale for this contract.
     */
    function createMarketSale(address nftContract, uint256 itemId, uint256 daysToExpire)
        public
        payable
        nonReentrant
    {
        uint price = idToMarketItem[itemId].price;
        uint tokenId = idToMarketItem[itemId].tokenId;
        require(
            msg.value == price,
            "Please submit the asking price in order to complete the purchase"
        );
        uint256 royaltyAmount = (idToMarketItem[itemId].royaltyPercent * price)
            .div(100);

        // transfer the NFT to the buyer.
        owner.transfer(msg.value - royaltyAmount);
        idToMarketItem[itemId].creator.transfer(royaltyAmount);
        IERC4907(nftContract).setUser(
            tokenId,
            msg.sender,
            uint64(block.timestamp + daysToExpire * 1 days)
        );
    }

    function getUserExpiration(address nftContract, uint256 tokenId)
        public
        view
        returns (uint256)
    {
        return IERC4907(nftContract).userExpires(tokenId);
    }

    /**
     * Returns all unsold market items.
     */
    function fetchMarketItems(address nftContract)
        public
        view
        returns (MarketItem[] memory)
    {
        uint totalItemCount = _itemIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        for (uint i = 0; i < totalItemCount; i++) {
            if (
                IERC4907(nftContract).userOf(idToMarketItem[i + 1].tokenId) ==
                address(0)
            ) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint i = 0; i < totalItemCount; i++) {
            if (
                IERC4907(nftContract).userOf(idToMarketItem[i + 1].tokenId) ==
                address(0)
            ) {
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
    function fetchMyNFTs(address nftContract)
        public
        view
        returns (MarketItem[] memory)
    {
        uint totalItemCount = _itemIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        for (uint i = 0; i < totalItemCount; i++) {
            if (
                IERC4907(nftContract).userOf(idToMarketItem[i + 1].tokenId) ==
                msg.sender
            ) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint i = 0; i < totalItemCount; i++) {
            if (
                IERC4907(nftContract).userOf(idToMarketItem[i + 1].tokenId) ==
                msg.sender
            ) {
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
    function fetchItemsCreated(address nftContract)
        public
        view
        returns (MarketItem[] memory)
    {
        uint totalItemCount = _itemIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        for (uint i = 0; i < totalItemCount; i++) {
            if (
                IERC4907(nftContract).userOf(idToMarketItem[i + 1].tokenId) ==
                msg.sender
            ) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint i = 0; i < totalItemCount; i++) {
            if (
                IERC4907(nftContract).userOf(idToMarketItem[i + 1].tokenId) ==
                msg.sender
            ) {
                uint currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }
}
