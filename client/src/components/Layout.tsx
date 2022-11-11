import React, { ReactNode } from "react";
import { Text, Center, Container, useColorModeValue } from "@chakra-ui/react";
import Header from "./Header";

type Props = {
  children: ReactNode;
};

const Layout = (props: Props) => {
  return (
    <>
      <Header />
      <Container maxW="container.xl" py="8">
        {props.children}
      </Container>
      <Center as="footer" bg={useColorModeValue("gray.100", "gray.700")} p={6}>
        <Text fontSize="md">Music Marketplace with Rental NFT</Text>
      </Center>
    </>
  );
};

export default Layout;
