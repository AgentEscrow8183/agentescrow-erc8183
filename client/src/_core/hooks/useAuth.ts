/**
 * useAuth — wallet-based auth hook for AgentEscrow.
 * Uses wagmi's useAccount for wallet state.
 * No Manus OAuth, no external redirects.
 */
import { useAccount, useDisconnect } from "wagmi";
import { useCallback } from "react";

export function useAuth() {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const { disconnect } = useDisconnect();

  const logout = useCallback(() => {
    disconnect();
  }, [disconnect]);

  return {
    user: isConnected ? { address, name: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null } : null,
    loading: isConnecting || isReconnecting,
    error: null,
    isAuthenticated: isConnected,
    address,
    logout,
    refresh: () => {},
  };
}
