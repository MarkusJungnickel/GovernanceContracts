/**
 * @type import('hardhat/config').HardhatUserConfig
 */
import "@nomiclabs/hardhat-ethers";
import "@openzeppelin/hardhat-upgrades";
import { PROVIDER_RINKEBY, PROVIDER_XDAI } from "./constants";

const Private_Key =
  "7168c840b9a4dde432e092e270c7a189d75d4a6b9a7af5152ad281397f874c2d";

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
      accounts: [`0x${Private_Key}`],
    },
    xDai: {
      url: PROVIDER_XDAI,
      accounts: [`0x${Private_Key}`],
    },
  },
};
