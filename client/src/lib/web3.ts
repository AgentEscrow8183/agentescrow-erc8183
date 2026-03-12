/* ==========================================================
   Web3 Configuration — AgentEscrow ERC-8183
   Wagmi v2 + RainbowKit + Viem
   ========================================================== */

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia, polygon, base, arbitrum } from "wagmi/chains";

export const wagmiConfig = getDefaultConfig({
  appName: "AgentEscrow — ERC-8183",
  projectId: "agentescrow8183", // WalletConnect project ID (demo)
  chains: [sepolia, mainnet, polygon, base, arbitrum],
  ssr: false,
});

// ERC-8183 Contract ABI (key functions)
export const AGENT_ESCROW_ABI = [
  // Events
  {
    type: "event",
    name: "JobCreated",
    inputs: [
      { name: "jobId", type: "uint256", indexed: true },
      { name: "client", type: "address", indexed: true },
      { name: "provider", type: "address", indexed: true },
      { name: "evaluator", type: "address", indexed: false },
      { name: "token", type: "address", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "JobFunded",
    inputs: [
      { name: "jobId", type: "uint256", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "WorkSubmitted",
    inputs: [
      { name: "jobId", type: "uint256", indexed: true },
      { name: "deliverableHash", type: "bytes32", indexed: false },
    ],
  },
  {
    type: "event",
    name: "JobCompleted",
    inputs: [{ name: "jobId", type: "uint256", indexed: true }],
  },
  {
    type: "event",
    name: "JobRejected",
    inputs: [
      { name: "jobId", type: "uint256", indexed: true },
      { name: "reason", type: "string", indexed: false },
    ],
  },
  // Read functions
  {
    type: "function",
    name: "getJob",
    stateMutability: "view",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [
      { name: "client", type: "address" },
      { name: "provider", type: "address" },
      { name: "evaluator", type: "address" },
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "state", type: "uint8" },
      { name: "deliverableHash", type: "bytes32" },
      { name: "expiry", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "jobCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  // Write functions
  {
    type: "function",
    name: "createJob",
    stateMutability: "nonpayable",
    inputs: [
      { name: "provider", type: "address" },
      { name: "evaluator", type: "address" },
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "expiry", type: "uint256" },
    ],
    outputs: [{ name: "jobId", type: "uint256" }],
  },
  {
    type: "function",
    name: "fundJob",
    stateMutability: "nonpayable",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "submitWork",
    stateMutability: "nonpayable",
    inputs: [
      { name: "jobId", type: "uint256" },
      { name: "deliverableHash", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "completeJob",
    stateMutability: "nonpayable",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "rejectJob",
    stateMutability: "nonpayable",
    inputs: [
      { name: "jobId", type: "uint256" },
      { name: "reason", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "claimPayment",
    stateMutability: "nonpayable",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "cancelJob",
    stateMutability: "nonpayable",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [],
  },
] as const;

// Job states mapping
export const JOB_STATES = {
  0: { label: "Open", color: "#2dd4bf", bg: "rgba(45,212,191,0.15)" },
  1: { label: "Funded", color: "#818cf8", bg: "rgba(129,140,248,0.15)" },
  2: { label: "Submitted", color: "#fb923c", bg: "rgba(251,146,60,0.15)" },
  3: { label: "Completed", color: "#4ade80", bg: "rgba(74,222,128,0.15)" },
  4: { label: "Rejected", color: "#f87171", bg: "rgba(248,113,113,0.15)" },
  5: { label: "Expired", color: "#94a3b8", bg: "rgba(148,163,184,0.15)" },
  6: { label: "Cancelled", color: "#64748b", bg: "rgba(100,116,139,0.15)" },
} as const;

// Demo contract address (Sepolia testnet — replace with real deployment)
export const ESCROW_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000" as `0x${string}`;

// Popular ERC-20 tokens on Sepolia for testing
export const DEMO_TOKENS = [
  { symbol: "ETH", address: "0x0000000000000000000000000000000000000000", decimals: 18, native: true },
  { symbol: "USDC", address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", decimals: 6, native: false },
  { symbol: "USDT", address: "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0", decimals: 6, native: false },
];
