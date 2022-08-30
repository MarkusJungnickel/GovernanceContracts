/**
 * @type import('hardhat/config').HardhatUserConfig
 */
import "@nomiclabs/hardhat-ethers";
import "@openzeppelin/hardhat-upgrades";
import { PROVIDER_RINKEBY, PROVIDER_XDAI } from "./constants";
import { PRIVATE_KEY_DEPLOYER } from "./privateKeys";

require("hardhat-contract-sizer");

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.15",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      {
        version: "0.5.17",
        settings: {},
      },
      {
        version: "0.4.24",
        settings: {},
      },
    ],
  },
  networks: {
    rinkeby: {
      url: PROVIDER_RINKEBY,
      accounts: [`0x${PRIVATE_KEY_DEPLOYER}`],
    },
    xDai: {
      url: PROVIDER_XDAI,
      accounts: [`0x${PRIVATE_KEY_DEPLOYER}`],
    },
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
  },
};
