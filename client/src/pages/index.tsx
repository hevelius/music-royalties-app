import React from "react";
import type { NextPage } from "next";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import { nftAddress, nftMarketAddress } from "../utils/constants";
import { NFT__factory as NFT } from "backend/typechain-types";
import { NFTMarket__factory as Market } from "backend/typechain-types";
import { NFT_ITEM_T } from "src/types/nft";
import NftGrid from "src/components/NftGrid";
import { MarketItemCreatedEventObject } from "backend/typechain-types/contracts/NFTMarket";
import axios from "axios";

const Home: NextPage = () => {
  //const [provider, setProvider] = React.useState<ethers.providers.Web3Provider>();
  const [nfts, setNfts] = React.useState<NFT_ITEM_T[]>([]);

  React.useEffect(() => {
    //setProvider(new ethers.providers.Web3Provider(window.ethereum));
    loadNFTs();
  }, []);

  const loadNFTs = async () => {
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    });
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const tokenContract = new ethers.Contract(nftAddress, NFT.abi, provider);
    const marketContract = new ethers.Contract(
      nftMarketAddress,
      Market.abi,
      provider,
    );
    const data = await marketContract.fetchMarketItems();

    /*
     *  map over items returned from smart contract and format
     *  them as well as fetch their token metadata
     */
    const items = await Promise.all(
      data.map(async (i: MarketItemCreatedEventObject) => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          creator: i.creator,
          image: `https://ipfs.io/ipfs/${meta.data.cover}`,
          name: meta.data.name,
          description: meta.data.description,
        };
        return item;
      }),
    );
    setNfts(items);
  };

  const buyNft = async (nft: NFT_ITEM_T) => {
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    });
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(nftMarketAddress, Market.abi, signer);

    /* user will be prompted to pay the asking proces to complete the transaction */
    const price = ethers.utils.parseUnits(nft.price.toString(), "ether");
    const transaction = await contract.createMarketSale(
      nftAddress,
      nft.tokenId,
      {
        value: price,
      },
    );
    await transaction.wait();
    loadNFTs();
  };

  /*const getProvider = () =>
    pipe(provider, O.fromNullable);

  const onClickHelloWorld = async () => {
    pipe(
      getProvider(),
      O.map((_) => HelloWorld.connect(contractAddress, _)),
      O.chainNullableK((helloContract) => helloContract.getHelloWorld()),
      O.chainNullableK((_) => _.then((result) => setHelloText(result))),
    );
  };

  const onClickSetHelloWorld = async () => {
    pipe(
      getProvider(),
      O.map((_) => HelloWorld.connect(contractAddress, _.getSigner())),
      O.chainNullableK((helloContract) => helloContract.setHelloWorld(value)),
    );
  };
  */

  if (!nfts.length)
    return <h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>;

  return <NftGrid nfts={nfts} onPress={buyNft} buttonTitle={"Buy"} />;
};

export default Home;
