'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { truncateAddress } from '@/lib/stellar';

interface WalletConnectProps {
  onConnect: (publicKey: string) => void;
  onDisconnect: () => void;
  publicKey: string | null;
}

type FreighterStatus = 'checking' | 'not-installed' | 'disconnected' | 'connected';

const FREIGHTER_INSTALL_URL = 'https://www.freighter.app';

export default function WalletConnect({ onConnect, onDisconnect, publicKey }: WalletConnectProps) {
  const [status, setStatus] = useState<FreighterStatus>('checking');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check Freighter on mount — v6 API
  useEffect(() => {
    const checkFreighter = async () => {
      try {
        const freighter = await import('@stellar/freighter-api');

        // isConnected() tells us if the extension is installed/available
        const connResult = await freighter.isConnected();
        if (!connResult?.isConnected) {
          setStatus('not-installed');
          return;
        }

        // isAllowed() tells us if the current site has been granted access before
        const allowedResult = await freighter.isAllowed();
        if (allowedResult?.isAllowed) {
          // Already authorized — get the address
          const addrResult = await freighter.getAddress();
          if (addrResult?.address && !addrResult.error) {
            setStatus('connected');
            onConnect(addrResult.address);
            return;
          }
        }

        setStatus('disconnected');
      } catch {
        // Extension not installed or blocked by CSP
        setStatus('not-installed');
      }
    };

    checkFreighter();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConnect = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const freighter = await import('@stellar/freighter-api');

      // Check if extension is installed
      const connResult = await freighter.isConnected();
      if (!connResult?.isConnected) {
        setStatus('not-installed');
        setError('Freighter wallet not detected. Please install it first.');
        setIsLoading(false);
        return;
      }

      // Request user to authorize site — setAllowed() is the v6 equivalent of requestAccess()
      const allowedResult = await freighter.setAllowed();
      if (!allowedResult?.isAllowed) {
        setError('Connection was rejected. Please approve the request in Freighter.');
        setIsLoading(false);
        return;
      }

      // Get the wallet address
      const addrResult = await freighter.getAddress();
      if (addrResult?.error) {
        setError('Could not retrieve wallet address: ' + addrResult.error);
        setIsLoading(false);
        return;
      }

      if (addrResult?.address) {
        setStatus('connected');
        onConnect(addrResult.address);
      } else {
        setError('No address returned from Freighter. Please try again.');
      }
    } catch (err) {
      setError('Failed to connect wallet. Please try again.');
      console.error('Freighter connect error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [onConnect]);

  const handleDisconnect = useCallback(() => {
    setStatus('disconnected');
    setError(null);
    onDisconnect();
  }, [onDisconnect]);

  // ─── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="glass-card p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stellar-600/20 border border-stellar-500/30 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-stellar-400">
              <path d="M21 18V19C21 20.1 20.1 21 19 21H5C3.89 21 3 20.1 3 19V5C3 3.9 3.89 3 5 3H19C20.1 3 21 3.9 21 5V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M9 12H21M21 12L17 8M21 12L17 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Freighter Wallet</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {status === 'checking' && 'Detecting wallet...'}
              {status === 'not-installed' && 'Not installed'}
              {status === 'disconnected' && 'Not connected'}
              {status === 'connected' && <span className="badge-connected">Connected</span>}
            </p>
          </div>
        </div>

        {status === 'connected' && (
          <button
            id="btn-disconnect"
            onClick={handleDisconnect}
            className="btn-danger text-xs"
          >
            Disconnect
          </button>
        )}
      </div>

      {/* Connected: show address */}
      {status === 'connected' && publicKey && (
        <div className="rounded-xl bg-black/30 border border-stellar-500/10 p-3 mt-2">
          <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">Wallet Address</p>
          <p className="address-mono text-stellar-300 tracking-wider">{truncateAddress(publicKey, 8)}</p>
          <p className="text-xs text-gray-600 mt-1 font-mono truncate">{publicKey}</p>
        </div>
      )}

      {/* Not installed */}
      {status === 'not-installed' && (
        <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-4 mb-4">
          <p className="text-amber-400 text-sm font-medium mb-1">⚠️ Freighter Not Detected</p>
          <p className="text-gray-400 text-xs mb-3">
            You need the Freighter browser extension to use this app.
          </p>
          <a
            href={FREIGHTER_INSTALL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-stellar-400 hover:text-stellar-300 font-medium transition-colors"
          >
            Install Freighter →
          </a>
        </div>
      )}

      {/* Error */}
      {error && status !== 'not-installed' && (
        <div className="error-box mb-4">
          <p className="text-red-400 text-sm">⚠️ {error}</p>
        </div>
      )}

      {/* Connect button */}
      {status !== 'connected' && (
        <button
          id="btn-connect-wallet"
          onClick={handleConnect}
          disabled={isLoading || status === 'checking'}
          className="btn-primary mt-2 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="spinner" />
              Connecting...
            </>
          ) : status === 'not-installed' ? (
            'Install Freighter First'
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 12H15M12 9V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Connect Wallet
            </>
          )}
        </button>
      )}
    </div>
  );
}
