import { AbiItem } from "web3-utils";
export const GNOSIS_PROXY_ABI: AbiItem[] = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "contract Proxy",
        name: "proxy",
        type: "address",
      },
    ],
    name: "ProxyCreation",
    type: "event",
  },
  {
    constant: false,
    inputs: [
      { internalType: "address", name: "_mastercopy", type: "address" },
      { internalType: "bytes", name: "initializer", type: "bytes" },
      { internalType: "uint256", name: "saltNonce", type: "uint256" },
    ],
    name: "calculateCreateProxyWithNonceAddress",
    outputs: [
      { internalType: "contract Proxy", name: "proxy", type: "address" },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { internalType: "address", name: "masterCopy", type: "address" },
      { internalType: "bytes", name: "data", type: "bytes" },
    ],
    name: "createProxy",
    outputs: [
      { internalType: "contract Proxy", name: "proxy", type: "address" },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { internalType: "address", name: "_mastercopy", type: "address" },
      { internalType: "bytes", name: "initializer", type: "bytes" },
      { internalType: "uint256", name: "saltNonce", type: "uint256" },
      {
        internalType: "contract IProxyCreationCallback",
        name: "callback",
        type: "address",
      },
    ],
    name: "createProxyWithCallback",
    outputs: [
      { internalType: "contract Proxy", name: "proxy", type: "address" },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { internalType: "address", name: "_mastercopy", type: "address" },
      { internalType: "bytes", name: "initializer", type: "bytes" },
      { internalType: "uint256", name: "saltNonce", type: "uint256" },
    ],
    name: "createProxyWithNonce",
    outputs: [
      { internalType: "contract Proxy", name: "proxy", type: "address" },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "proxyCreationCode",
    outputs: [{ internalType: "bytes", name: "", type: "bytes" }],
    payable: false,
    stateMutability: "pure",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "proxyRuntimeCode",
    outputs: [{ internalType: "bytes", name: "", type: "bytes" }],
    payable: false,
    stateMutability: "pure",
    type: "function",
  },
];
