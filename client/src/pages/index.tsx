import React from "react";
import type { NextPage } from "next";
import Head from "next/head";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/function";
import { VStack, Heading, Box } from "@chakra-ui/layout";
import { Button, Input } from "@chakra-ui/react";
import { ethers } from "ethers";
import Install from "../components/Install";
import { HelloWorld__factory as HelloWorld } from "backend/typechain-types";
import { contractAddress } from "../utils/constants";

declare let window: any;

const Home: NextPage = () => {
  const [provider, setProvider] =
    React.useState<ethers.providers.Web3Provider>();

  const [helloText, setHelloText] = React.useState("");
  const [value, setValue] = React.useState("");
  const helloTextChange = (event: any) => setValue(event.target.value);

  React.useEffect(() => {
    setProvider(new ethers.providers.Web3Provider(window.ethereum));
  }, []);

  if (typeof window === "undefined") {
    return <></>;
  }

  if (!window.ethereum) {
    return <Install />;
  }

  const getProvider = () =>
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

  return ( provider !== undefined ?
    <>
      <Head>
        <title>HelloWorld DApp</title>
      </Head>

      <Heading as="h4" size="md">
        Interact with HelloWorld contract
      </Heading>
      <VStack>
          
            <Box w="100%" my={4}>
              <Button type="button" w="100%" onClick={onClickHelloWorld}>
                getHelloWorld()
              </Button>
            </Box>
            <Box w="100%" my={4}>
              <Input
                onChange={helloTextChange}
                placeholder="write your hello text here"
                size="sm"
              />
              <Button type="button" w="100%" onClick={onClickSetHelloWorld}>
                {`setHelloWorld(${value})`}
              </Button>
            </Box>
            <Box w="100%" my={4}>
              Result: {helloText}
            </Box>
          
      </VStack>
    </> : <></>
  );
};

export default Home;
