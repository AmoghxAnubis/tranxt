'use client';

import React, { useEffect, useState } from 'react';
import { getXLMBalance } from '@/lib/stellar';

interface BalanceCardProps {
  publicKey: string;
  refreshTrigger?: number;
}

type LoadState = 'idle' | 'loading' | 'loaded' | 'error';

export default function BalanceCard({ publicKey, refreshTrigger = 0 }: BalanceCardProps) {
  const [balance, setBalance] = useState<string | null>(null);
  const [rawBalance, setRawBalance] = useState<number>(0);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (!publicKey) return;

    const fetchBalance = async () => {
      setLoadState('loading');
      setError(null);
      try {
        const result = await getXLMBalance(publicKey);
        setBalance(result.xlm);
        setRawBalance(result.raw);
        setLoadState('loaded');
        setLastUpdated(new Date());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load balance');
        setLoadState('error');
      }
    };

    fetchBalance();
  }, [publicKey, refreshTrigger]);

  const handleRefresh = async () => {
    if (loadState === 'loading') return;
    setLoadState('loading');
    setError(null);
    try {
      const result = await getXLMBalance(publicKey);
      setBalance(result.xlm);
      setRawBalance(result.raw);
      setLoadState('loaded');
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load balance');
      setLoadState('error');
    }
  };

  // Determine balance health indicator
  const getBalanceColor = (raw: number) => {
    if (raw >= 100) return 'text-green-400';
    if (raw >= 10) return 'text-stellar-400';
    if (raw > 0) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="glass-card p-6 animate-fade-in">
      {/* Card header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="#a855f7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="#a855f7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="#a855f7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">XLM Balance</h2>
            <p className="text-xs text-gray-500 mt-0.5">Stellar Testnet</p>
          </div>
        </div>

        {/* Refresh button */}
        <button
          id="btn-refresh-balance"
          onClick={handleRefresh}
          disabled={loadState === 'loading'}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all disabled:opacity-50"
          title="Refresh balance"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            className={`text-gray-400 ${loadState === 'loading' ? 'animate-spin' : ''}`}
          >
            <path
              d="M4 4V9H9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M20 20V15H15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 9C5.06 6.34 7.4 4.34 10.28 4.07C13.15 3.8 15.95 5.28 17.5 7.83"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M20 15C18.94 17.66 16.6 19.66 13.72 19.93C10.85 20.2 8.05 18.72 6.5 16.17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Balance display */}
      <div className="rounded-2xl bg-gradient-to-br from-black/40 to-stellar-900/20 border border-white/5 p-6 text-center">
        {loadState === 'loading' && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-stellar-500/30 border-t-stellar-500 animate-spin" />
            <p className="text-gray-500 text-sm">Fetching balance...</p>
          </div>
        )}

        {loadState === 'error' && (
          <div className="text-center">
            <p className="text-red-400 text-2xl mb-2">⚠️</p>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {loadState === 'loaded' && balance !== null && (
          <div className="animate-fade-in">
            <div className="flex items-end justify-center gap-2 mb-1">
              <span
                id="balance-display"
                className={`text-4xl font-bold tabular-nums ${getBalanceColor(rawBalance)}`}
              >
                {balance}
              </span>
              <span className="text-gray-400 text-xl font-medium mb-1">XLM</span>
            </div>

            {/* Low balance warning */}
            {rawBalance < 2 && rawBalance > 0 && (
              <p className="text-amber-400/80 text-xs mt-2">
                ⚡ Low balance — keep min 1 XLM for reserve
              </p>
            )}
            {rawBalance === 0 && (
              <p className="text-red-400/80 text-xs mt-2">
                Fund your account at{' '}
                <a
                  href="https://friendbot.stellar.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-red-300 transition-colors"
                >
                  Stellar Friendbot
                </a>
              </p>
            )}
          </div>
        )}

        {loadState === 'idle' && (
          <p className="text-gray-600 text-sm">Balance will appear here</p>
        )}
      </div>

      {/* Last updated */}
      {lastUpdated && loadState !== 'loading' && (
        <p className="text-xs text-gray-600 text-center mt-3">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
