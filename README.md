# MUSIC ROYALTIES DAPP NFT MARKETPLACE
A sample DApp using hardhat typescript and nextjs.

![example workflow](https://github.com/hevelius/music-royalties-dapp/actions/workflows/node.yml/badge.svg)

## Pre-requisite
* ipfs running as local daemon
* python3

## Install
```yarn install```

## Run hardhat node
```yarn workspace backend hardhat node```

## Compile and deploy
* ```yarn workspace backend compile```
* ```yarn workspace backend deploy```

## Run ipfs
```ipfs daemon --offline```

## Run python constellation generator
```cd generator && python index.py```

## Run frontend
```yarn workspace client run dev```
