import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia, mainnet } from "wagmi/chains";

export const wagmiConfig = getDefaultConfig({
  appName: "AgentEscrow ERC-8183",
  projectId: "agentescrow8183",
  chains: [sepolia, mainnet],
  ssr: false,
});

// ERC-8183 Contract ABI (core interface)
export const ESCROW_ABI = [
  {
    name: "createJob",
    type: "function",
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
    name: "fundJob",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "submitWork",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "jobId", type: "uint256" },
      { name: "deliverableHash", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    name: "completeJob",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "rejectJob",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "claimPayment",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "cancelJob",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "getJob",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "client", type: "address" },
          { name: "provider", type: "address" },
          { name: "evaluator", type: "address" },
          { name: "token", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "expiry", type: "uint256" },
          { name: "state", type: "uint8" },
          { name: "deliverableHash", type: "bytes32" },
        ],
      },
    ],
  },
  {
    name: "getJobState",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    name: "JobCreated",
    type: "event",
    inputs: [
      { name: "jobId", type: "uint256", indexed: true },
      { name: "client", type: "address", indexed: true },
      { name: "provider", type: "address", indexed: true },
    ],
  },
  {
    name: "JobStateChanged",
    type: "event",
    inputs: [
      { name: "jobId", type: "uint256", indexed: true },
      { name: "newState", type: "uint8", indexed: false },
    ],
  },
] as const;

// Sepolia testnet contract address (placeholder — update after deployment)
export const ESCROW_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000" as `0x${string}`;

// Common ERC-20 tokens on Sepolia
export const SEPOLIA_TOKENS = [
  { symbol: "USDC", address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", decimals: 6 },
  { symbol: "USDT", address: "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06", decimals: 6 },
  { symbol: "DAI", address: "0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357", decimals: 18 },
  { symbol: "WETH", address: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14", decimals: 18 },
];

export type JobState = "open" | "funded" | "submitted" | "completed" | "rejected" | "expired" | "cancelled";

export const JOB_STATE_COLORS: Record<JobState, string> = {
  open: "text-[oklch(0.82_0.05_200)]",
  funded: "text-[oklch(0.72_0.22_195)]",
  submitted: "text-[oklch(0.75_0.22_55)]",
  completed: "text-[oklch(0.78_0.22_145)]",
  rejected: "text-[oklch(0.62_0.25_25)]",
  expired: "text-[oklch(0.55_0.04_220)]",
  cancelled: "text-[oklch(0.55_0.04_220)]",
};

export const JOB_STATE_BADGE: Record<JobState, string> = {
  open: "bg-[oklch(0.82_0.05_200/0.15)] text-[oklch(0.82_0.05_200)] border-[oklch(0.82_0.05_200/0.3)]",
  funded: "bg-[oklch(0.72_0.22_195/0.15)] text-[oklch(0.72_0.22_195)] border-[oklch(0.72_0.22_195/0.3)]",
  submitted: "bg-[oklch(0.75_0.22_55/0.15)] text-[oklch(0.75_0.22_55)] border-[oklch(0.75_0.22_55/0.3)]",
  completed: "bg-[oklch(0.78_0.22_145/0.15)] text-[oklch(0.78_0.22_145)] border-[oklch(0.78_0.22_145/0.3)]",
  rejected: "bg-[oklch(0.62_0.25_25/0.15)] text-[oklch(0.62_0.25_25)] border-[oklch(0.62_0.25_25/0.3)]",
  expired: "bg-[oklch(0.55_0.04_220/0.15)] text-[oklch(0.55_0.04_220)] border-[oklch(0.55_0.04_220/0.3)]",
  cancelled: "bg-[oklch(0.55_0.04_220/0.15)] text-[oklch(0.55_0.04_220)] border-[oklch(0.55_0.04_220/0.3)]",
};
