import NextLink from "next/link";
import {
  Flex,
  useColorModeValue,
  Spacer,
  Heading,
  LinkBox,
} from "@chakra-ui/react";

const siteTitle = "HelloWorld DApp";
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
          <Heading size="md">{siteTitle}</Heading>
        </NextLink>
      </LinkBox>
      <Spacer />
    </Flex>
  );
};

export default Header;
