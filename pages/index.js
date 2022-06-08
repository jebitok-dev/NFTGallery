import React, {useState} from "react";
import Head from "next/head";
import Image from "next/image";
// import styles from "../styles/Home.module.css";
import NFTCard from "./NFTCard";

export default function Home() {
  const [wallet, setWalletAddress] = useState("");
  const [collection, setCollectionAddress] = useState("");
  const [NFTs, setNFTs] = useState([]);
  const api_key = process.env.API_KEY;
  const [fetchForCollection, setFetchForCollection] = useState(false);
  const [startToken, setStartToken] = useState("");

  const fetchNFTs = async () => {
    let nfts;
    console.log("fetching nfts...");
    const baseURL = `https://polygon-mainnet.g.alchemy.com/v2/${api_key}/getNFTs/`;
    var requestOptions = {
      method: "GET",
    };
    if (!collection.length) {
      const fetchURL = `${baseURL}?owner=${wallet}`;
      nfts = await fetch(fetchURL, requestOptions).then((data) => data.json());
    } else {
      console.log("fetching nfts for collection owned by address");
      const fetchURL = `${baseURL}?owner=${wallet}&contractAddresses%5B%5D=${collection}?pageKey=${startToken}`;
      nfts = await fetch(fetchURL, requestOptions).then((data) => data.json());
    }

    if (nfts) {
      console.log("nfts:", nfts);
      setNFTs([...NFTs, ...nfts.ownedNfts]);
      if (nfts.pagesKey) {
        setStartToken(nfts.pagesKey);
      }
    }
  };

  const fetchNFTsForCollection = async () => {
    if (collection.length) {
      var requestOptions = {
        method: "GET",
      };
      const baseURL = `https://polygon-mainnet.g.alchemy.com/v2/${api_key}/getNFTsForCollection/`;
      const fetchURL = `${baseURL}?contractAddress=${collection}&withMetadata=${"true"}&startToken=${startToken}`;
      const nfts = await fetch(fetchURL, requestOptions).then((data) =>
        data.json()
      );
      if (nfts) {
        console.log(nfts.nextToken);
        if (nfts.nextToken) {
          setStartToken(nfts.nextToken);
        }
        console.log(NFTs.length);
        console.log("NFTs in collection:", nfts);
        if (NFTs.length > 0) {
          setNFTs([...NFTs, ...nfts.nfts]);
        } else {
          setNFTs(nfts.nfts);
        }
      }
    }

    return (
      <div className='flex flex-col items-center justify-center py-8 gap-y-3'>
        <div className='flex flex-col w-full justify-center items-center gap-y-2'>
          <input
            disabled={fetchForCollection}
            className='w-2/5 bg-slate-100 py-2 px-2 rounded-lg text-gray-800 focus:outline-blue-300 disabled:bg-slate-50 disabled:text-gray-50'
            onChange={(e) => {
              setWalletAddress(e.target.value);
            }}
            value={wallet}
            type={"text"}
            placeholder='Add your wallet address'></input>
          <input
            type={"text"}
            className='w-2/5 bg-slate-100 py-2 px-2 rounded-lg text-gray-800 focus:outline-blue-300 disabled:bg-slate-50 disabled:text-gray-50'
            onChange={(e) => {
              setCollectionAddress(e.target.value);
            }}
            value={collection}
            placeholder='Add the collection address'></input>
          <label className='text-gray-600 '>
            <input
              onChange={(e) => {
                setFetchForCollection(e.target.checked);
              }}
              type={"checkbox"}
              className='mr-2'></input>
            Fetch for collection
          </label>
          <button
            className={
              "disabled:bg-slate-500 text-white bg-blue-400 px-4 py-2 mt-3 rounded-sm w-1/5"
            }
            onClick={() => {
              setNFTs([])
              if (fetchForCollection) {
                fetchNFTsForCollection();
              } else fetchNFTs();
            }}>
            Let's go!{" "}
          </button>
        </div>
        <div className='flex flex-wrap gap-y-12 mt-4 w-5/6 gap-x-2 justify-center'>
          {NFTs.length &&
            NFTs.map((nft, index) => {
              return <NFTCard key={index + "nftCard"} nft={nft}></NFTCard>;
            })}
        </div>
        {startToken ? (
          <button
            className={
              "disabled:bg-slate-500 text-white bg-blue-400 px-4 py-2 mt-3 rounded-sm w-1/5"
            }
            onClick={() => {
              if (fetchForCollection) {
                fetchNFTsForCollection();
              } else fetchNFTs();
            }}>
            More
          </button>
        ) : (
          <></>
        )}
      </div>
    );
  };
}
