import {
  Box,
  Button,
  Grid,
  GridItem,
  Image,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
} from "@chakra-ui/react";
import React from "react";
import { NFT_ITEM_T } from "src/types/nft";

type Props = {
  nfts: NFT_ITEM_T[];
  onPress?: (nft: NFT_ITEM_T, days: number) => void;
  buttonTitle?: string;
};

const NftGrid = (props: Props) => {
  const [expirationDays, setExpirationDays] = React.useState(1);
  return (
    <Grid templateColumns="repeat(4, 1fr)" gap={6}>
      {props.nfts.map((nft, i) => (
        <GridItem w="100%" key={i}>
          <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
            <Box w="100%">
              <Image src={nft.image} alt={nft.name} boxSize="200" />
            </Box>
            <Box p="1">{nft.name}</Box>
            <Box p="1">{nft.description}</Box>
            <Box p="2">{nft.price} x day</Box>
            {props.buttonTitle && props.onPress && (
              <>
                <NumberInput defaultValue={1} min={1} max={30} onChange={(valueString) => setExpirationDays(parseInt(valueString))}>
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Button
                  width={"100%"}
                  p="2"
                  onClick={() =>
                    props.onPress !== undefined ? props.onPress(nft, expirationDays) : undefined
                  }
                >
                  {props.buttonTitle}
                </Button>
              </>
            )}
          </Box>
        </GridItem>
      ))}
    </Grid>
  );
};

export default NftGrid;
