/* ==========================================================
   useEscrowContract — Real on-chain transactions for ERC-8183
   Uses wagmi v2 writeContract + waitForTransactionReceipt
   ========================================================== */

import { useCallback } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
  usePublicClient,
} from "wagmi";
import { parseUnits, keccak256, toHex, encodePacked } from "viem";
import { AGENT_ESCROW_ABI, ESCROW_CONTRACT_ADDRESS } from "@/lib/web3";
import { toast } from "sonner";

// ERC-20 minimal ABI for approve
const ERC20_ABI = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
] as const;

export const CONTRACT_DEPLOYED = ESCROW_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000";

export type TxStatus = "idle" | "pending" | "confirming" | "success" | "error";

/**
 * Hook for all ERC-8183 on-chain interactions.
 * Falls back to off-chain demo mode if contract is not deployed.
 */
export function useEscrowContract() {
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  /**
   * Wait for transaction to be mined and return receipt
   */
  const waitForTx = useCallback(
    async (hash: `0x${string}`, description: string) => {
      if (!publicClient) throw new Error("No public client");
      const toastId = toast.loading(`⏳ ${description}...`, {
        description: `Tx: ${hash.slice(0, 10)}...${hash.slice(-6)}`,
      });
      try {
        const receipt = await publicClient.waitForTransactionReceipt({ hash, confirmations: 1 });
        if (receipt.status === "success") {
          toast.success(`✅ ${description} confirmed!`, {
            id: toastId,
            description: `Block #${receipt.blockNumber}`,
            duration: 5000,
          });
        } else {
          toast.error(`❌ Transaction reverted`, { id: toastId });
          throw new Error("Transaction reverted");
        }
        return receipt;
      } catch (err) {
        toast.error(`❌ ${description} failed`, { id: toastId, description: String(err) });
        throw err;
      }
    },
    [publicClient]
  );

  /**
   * createJob — calls createJob(provider, evaluator, token, amount, expiry) on-chain
   * Returns the transaction hash
   */
  const createJob = useCallback(
    async (params: {
      provider: `0x${string}`;
      evaluator: `0x${string}`;
      token: `0x${string}`;
      amount: bigint;
      expiry: bigint;
    }): Promise<`0x${string}`> => {
      if (!CONTRACT_DEPLOYED) {
        throw new Error("Contract not deployed yet. Using off-chain demo mode.");
      }
      const hash = await writeContractAsync({
        address: ESCROW_CONTRACT_ADDRESS,
        abi: AGENT_ESCROW_ABI,
        functionName: "createJob",
        args: [params.provider, params.evaluator, params.token, params.amount, params.expiry],
      });
      await waitForTx(hash, "Create Job");
      return hash;
    },
    [writeContractAsync, waitForTx]
  );

  /**
   * approveAndFundJob — ERC-20 approve + fundJob in sequence
   */
  const approveAndFundJob = useCallback(
    async (params: {
      jobId: bigint;
      tokenAddress: `0x${string}`;
      amount: bigint;
      isNative?: boolean;
    }): Promise<`0x${string}`> => {
      if (!CONTRACT_DEPLOYED) {
        throw new Error("Contract not deployed yet. Using off-chain demo mode.");
      }

      let fundHash: `0x${string}`;

      if (params.isNative) {
        // Native ETH — send value directly
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        fundHash = await (writeContractAsync as any)({
          address: ESCROW_CONTRACT_ADDRESS,
          abi: AGENT_ESCROW_ABI,
          functionName: "fundJob",
          args: [params.jobId],
          value: params.amount,
        });
      } else {
        // ERC-20 — approve first, then fund
        const approveToastId = toast.loading("Step 1/2: Approving token spend...");
        const approveHash = await writeContractAsync({
          address: params.tokenAddress,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [ESCROW_CONTRACT_ADDRESS, params.amount],
        });
        toast.loading("Step 1/2: Waiting for approval...", { id: approveToastId });
        await publicClient?.waitForTransactionReceipt({ hash: approveHash, confirmations: 1 });
        toast.success("Step 1/2: Token approved!", { id: approveToastId, duration: 3000 });

        // Now fund
        fundHash = await writeContractAsync({
          address: ESCROW_CONTRACT_ADDRESS,
          abi: AGENT_ESCROW_ABI,
          functionName: "fundJob",
          args: [params.jobId],
        });
      }

      await waitForTx(fundHash, "Fund Job");
      return fundHash;
    },
    [writeContractAsync, waitForTx, publicClient]
  );

  /**
   * submitWork — provider submits deliverable hash on-chain
   */
  const submitWork = useCallback(
    async (params: {
      jobId: bigint;
      deliverableUrl: string;
    }): Promise<`0x${string}`> => {
      if (!CONTRACT_DEPLOYED) {
        throw new Error("Contract not deployed yet. Using off-chain demo mode.");
      }
      // Hash the deliverable URL to bytes32
      const deliverableHash = keccak256(toHex(params.deliverableUrl)) as `0x${string}`;
      const hash = await writeContractAsync({
        address: ESCROW_CONTRACT_ADDRESS,
        abi: AGENT_ESCROW_ABI,
        functionName: "submitWork",
        args: [params.jobId, deliverableHash as `0x${string}`],
      });
      await waitForTx(hash, "Submit Work");
      return hash;
    },
    [writeContractAsync, waitForTx]
  );

  /**
   * completeJob — evaluator approves work, releases escrow
   */
  const completeJob = useCallback(
    async (jobId: bigint): Promise<`0x${string}`> => {
      if (!CONTRACT_DEPLOYED) {
        throw new Error("Contract not deployed yet. Using off-chain demo mode.");
      }
      const hash = await writeContractAsync({
        address: ESCROW_CONTRACT_ADDRESS,
        abi: AGENT_ESCROW_ABI,
        functionName: "completeJob",
        args: [jobId],
      });
      await waitForTx(hash, "Complete Job");
      return hash;
    },
    [writeContractAsync, waitForTx]
  );

  /**
   * rejectJob — evaluator/client rejects work, refunds client
   */
  const rejectJob = useCallback(
    async (jobId: bigint, reason: string): Promise<`0x${string}`> => {
      if (!CONTRACT_DEPLOYED) {
        throw new Error("Contract not deployed yet. Using off-chain demo mode.");
      }
      const hash = await writeContractAsync({
        address: ESCROW_CONTRACT_ADDRESS,
        abi: AGENT_ESCROW_ABI,
        functionName: "rejectJob",
        args: [jobId, reason],
      });
      await waitForTx(hash, "Reject Job");
      return hash;
    },
    [writeContractAsync, waitForTx]
  );

  /**
   * cancelJob — client cancels open job
   */
  const cancelJob = useCallback(
    async (jobId: bigint): Promise<`0x${string}`> => {
      if (!CONTRACT_DEPLOYED) {
        throw new Error("Contract not deployed yet. Using off-chain demo mode.");
      }
      const hash = await writeContractAsync({
        address: ESCROW_CONTRACT_ADDRESS,
        abi: AGENT_ESCROW_ABI,
        functionName: "cancelJob",
        args: [jobId],
      });
      await waitForTx(hash, "Cancel Job");
      return hash;
    },
    [writeContractAsync, waitForTx]
  );

  /**
   * claimPayment — provider claims payment after completion
   */
  const claimPayment = useCallback(
    async (jobId: bigint): Promise<`0x${string}`> => {
      if (!CONTRACT_DEPLOYED) {
        throw new Error("Contract not deployed yet. Using off-chain demo mode.");
      }
      const hash = await writeContractAsync({
        address: ESCROW_CONTRACT_ADDRESS,
        abi: AGENT_ESCROW_ABI,
        functionName: "claimPayment",
        args: [jobId],
      });
      await waitForTx(hash, "Claim Payment");
      return hash;
    },
    [writeContractAsync, waitForTx]
  );

  return {
    CONTRACT_DEPLOYED,
    createJob,
    approveAndFundJob,
    submitWork,
    completeJob,
    rejectJob,
    cancelJob,
    claimPayment,
  };
}
