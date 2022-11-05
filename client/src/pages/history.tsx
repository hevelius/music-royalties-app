/* pages/creator-dashboard.js */
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import type { NextPage } from "next";
//import axios from "axios";
import Web3Modal from "web3modal";

import { nftMarketAddress, nftAddress, CHAIN_ID } from "../utils/constants";

import { NFTMarket__factory as Market } from "backend/typechain-types";
import { NFT__factory as NFT } from "backend/typechain-types";
import { NFT_ITEM_T } from "src/types/nft";
import NftGrid from "src/components/NftGrid";
import { Container, Text } from "@chakra-ui/react";
import { MarketItemCreatedEventObject } from "backend/typechain-types/contracts/NFTMarket";

const History: NextPage = () => {
  const [nfts, setNfts] = useState<NFT_ITEM_T[]>([]);
  const [sold, setSold] = useState<NFT_ITEM_T[]>([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  useEffect(() => {
    loadNFTs();
  }, []);
  const loadNFTs = async () => {
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    });
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const network = await provider.getNetwork();
    const chainId = network.chainId;
    if (chainId === CHAIN_ID) {
      const marketContract = new ethers.Contract(
        nftMarketAddress,
        Market.abi,
        signer,
      );
      const tokenContract = new ethers.Contract(nftAddress, NFT.abi, provider);
      const data = await marketContract.fetchItemsCreated();

      const items = await Promise.all(
        data.map(async (i: MarketItemCreatedEventObject) => {
          const tokenUri = await tokenContract.tokenURI(i.tokenId);
          const meta = "{}"; //await axios.get(tokenUri)
          let price = ethers.utils.formatUnits(i.price.toString(), "ether");
          let item = {
            price,
            tokenId: i.tokenId.toNumber(),
            seller: i.seller,
            owner: i.owner,
            sold: i.sold,
            image: "meta.data.image",
            name: "meta.data.name",
            description: "meta.data.description",
          };
          return item;
        }),
      );
      /* create a filtered array of items that have been sold */
      const soldItems = items.filter((i) => i.sold);
      setSold(soldItems);
      setNfts(items);
      setLoadingState("loaded");
    } else {
      console.log("wrong network");
    }
  };
  if (loadingState === "loaded" && !nfts.length)
    return <h1 className="py-10 px-20 text-3xl">No assets created</h1>;
  return (
    <Container>
      <Text fontSize='2xl'>{"Item created"}</Text>
      <NftGrid nfts={nfts} />
      <Text fontSize='2xl'>{"Item sold"}</Text>
      <NftGrid nfts={sold} />
    </Container>
  );
};

export default History;
