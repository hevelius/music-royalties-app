import { Box, Button, Grid, GridItem, Image } from "@chakra-ui/react";
import React from "react";
import { NFT_ITEM_T } from "src/types/nft";

type Props = {
  nfts: NFT_ITEM_T[];
  onPress?: (nft: NFT_ITEM_T) => void;
  buttonTitle?: string;
};

const NftGrid = (props: Props) => {
  return (
    <Grid templateColumns='repeat(4, 1fr)' gap={6}>
          {
            props.nfts.map((nft, i) => (
              <GridItem w='100%'  key={i}>
              <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
                <Box w="100%">
                <Image src={nft.image} alt={nft.name} boxSize="200"/>

                </Box>
                <Box p="1">
                      {nft.name}
                </Box>
                <Box p="1">
                      {nft.description}
                </Box>
                <Box p="2">
                      {nft.price}
                </Box>
                {(props.buttonTitle && props.onPress) && (
                <Button width={'100%'} p="2" onClick={() => props.onPress !== undefined ? props.onPress(nft): undefined}>
                  {props.buttonTitle}
                </Button>
                )}
              </Box>
              </GridItem>
            ))
          }
      </Grid>
  );
};

export default NftGrid;
