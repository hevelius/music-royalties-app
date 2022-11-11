import NextLink from "next/link";
import {
  Flex,
  useColorModeValue,
  Spacer,
  Heading,
  LinkBox,
} from "@chakra-ui/react";

const Header = () => {
  return (
    <Flex
      as="header"
      bg={useColorModeValue("gray.100", "gray.900")}
      p={4}
      alignItems="center"
    >
      <LinkBox>
        <NextLink href={"/"} passHref>
          <Heading size="md">{"Marketplace"}</Heading>
        </NextLink>
      </LinkBox>
      <Spacer />
      <LinkBox>
        <NextLink href={"/create-item"} passHref>
          <Heading size="md">{"Mint"}</Heading>
        </NextLink>
      </LinkBox>
      <Spacer />
      <LinkBox>
        <NextLink href={"/my-nfts"} passHref>
          <Heading size="md">{"My NFTs"}</Heading>
        </NextLink>
      </LinkBox>
      <Spacer />     
    </Flex>
  );
};

export default Header;
