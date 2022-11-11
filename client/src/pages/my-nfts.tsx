/* pages/my-assets.js */
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import type { NextPage } from "next";
import axios from 'axios';
import Web3Modal from "web3modal";
import { useRouter } from "next/router";
import { nftAddress, nftMarketAddress } from "../utils/constants";
import { NFTMarket__factory as Market } from "backend/typechain-types";
import { NFT__factory as NFT } from "backend/typechain-types";
import Head from "next/head";
import { NFT_ITEM_T } from "src/types/nft";
import NftGrid from "src/components/NftGrid";
import { MarketItemCreatedEventObject } from "backend/typechain-types/contracts/NFTMarket";
import { constNull } from "fp-ts/lib/function";

const MyNFTs: NextPage = () => {
  const [nfts, setNfts] = useState<NFT_ITEM_T[]>([]);
  const router = useRouter();
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

    const marketContract = new ethers.Contract(
      nftMarketAddress,
      Market.abi,
      signer,
    );
    const tokenContract = new ethers.Contract(nftAddress, NFT.abi, provider);
    const data = await marketContract.fetchMyNFTs(nftAddress);

    const items = await Promise.all(
      data.map(async (i: MarketItemCreatedEventObject) => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        const expires_at = await tokenContract.userExpires(i.tokenId);

        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          itemId: i.itemId.toNumber(),
          price,
          tokenId: i.tokenId.toNumber(),
          image: `https://ipfs.io/ipfs/${meta.data.cover}`,
          name: meta.data.name,
          description: meta.data.description,
          expires_at: expires_at.toNumber(),
        };
        return item;
      }),
    );
    setNfts(items);
    setLoadingState("loaded");
  };

  if (loadingState === "loaded" && !nfts.length)
    return <h1 className="py-10 px-20 text-3xl">No assets owned</h1>;

  return (
    <>
      <Head>
        <title>HelloWorld DApp</title>
      </Head>
      <NftGrid nfts={nfts} onPress={constNull} buttonTitle={"Sell"} />
    </>
  );
};

export default MyNFTs;
