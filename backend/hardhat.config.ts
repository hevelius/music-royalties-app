import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-gas-reporter";

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
    }
  },
  gasReporter: {
    enabled: true,
    currency: "USD"
  }  
};

export default config;
