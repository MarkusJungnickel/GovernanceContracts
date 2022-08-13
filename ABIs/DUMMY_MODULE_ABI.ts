import { AbiItem } from "web3-utils";
export const DUMMY_MODULE_ABI: AbiItem[] = [
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
      {
        internalType: "address",
        name: "avatar",
        type: "address",
      },
      {
        internalType: "uint8",
        name: "operation",
        type: "uint8",
      },
    ],
    name: "exec",
    outputs: [
      {
        internalType: "bool",
        name: "success",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];
