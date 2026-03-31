'use client';

import React, { useState, useCallback } from 'react';
import WalletConnect from '@/components/WalletConnect';
import BalanceCard from '@/components/BalanceCard';
import SendForm from '@/components/SendForm';

// ─── STAR FIELD ───────────────────────────────────────────────────────────────
const StarField = () => (
  <div className="stars" aria-hidden="true">
    {Array.from({ length: 80 }).map((_, i) => {
      const size = Math.random() * 2 + 0.5;
      const top = Math.random() * 100;
      const left = Math.random() * 100;
      const delay = Math.random() * 3;
      const duration = Math.random() * 3 + 2;
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: `${top}%`,
            left: `${left}%`,
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.6)',
            animation: `pulse ${duration}s ${delay}s ease-in-out infinite alternate`,
          }}
        />
      );
    })}
  </div>
);

// ─── HEADER ───────────────────────────────────────────────────────────────────
const Header = ({ isConnected }: { isConnected: boolean }) => (
  <header className="relative z-10 text-center py-10 px-4">
    {/* Logo mark */}
    <div className="flex justify-center mb-4">
      <div className="relative">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center logo-glow"
          style={{
            background: 'linear-gradient(135deg, #0e8fe7 0%, #a855f7 100%)',
          }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path
              d="M16 4L4 10L16 16L28 10L16 4Z"
              fill="white"
              fillOpacity="0.9"
            />
            <path
              d="M4 22L16 28L28 22"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeOpacity="0.7"
            />
            <path
              d="M4 16L16 22L28 16"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        {/* Glow ring */}
        <div
          className="absolute inset-0 rounded-2xl opacity-30"
          style={{
            background: 'linear-gradient(135deg, #0e8fe7 0%, #a855f7 100%)',
            filter: 'blur(12px)',
            transform: 'scale(1.2)',
            zIndex: -1,
          }}
        />
      </div>
    </div>

    <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
      Stellar{' '}
      <span
        style={{
          background: 'linear-gradient(135deg, #0e8fe7 0%, #a855f7 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        Pay
      </span>
    </h1>

    <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">
      Send XLM on the Stellar Testnet · Powered by Freighter
    </p>

    {/* Network badge */}
    <div className="flex justify-center mt-4">
      <div className="inline-flex items-center gap-2 bg-black/40 border border-white/10 rounded-full px-3 py-1.5">
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span className="text-xs text-gray-400 font-medium">Testnet</span>
        {isConnected && (
          <>
            <span className="text-gray-600">·</span>
            <span className="text-xs text-green-400 font-medium">Wallet Connected</span>
          </>
        )}
      </div>
    </div>
  </header>
);

// ─── NOT CONNECTED STATE ──────────────────────────────────────────────────────
const NotConnectedHero = () => (
  <div className="glass-card p-8 text-center animate-fade-in">
    <div className="w-16 h-16 rounded-full bg-stellar-600/10 border border-stellar-500/20 flex items-center justify-center mx-auto mb-4">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-stellar-400">
        <path
          d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M12 8V12M12 16H12.01"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
    <h3 className="text-white font-semibold mb-2">Connect Your Wallet</h3>
    <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
      Connect your Freighter wallet above to view your XLM balance and send transactions.
    </p>

    <div className="divider" />

    <div className="grid grid-cols-3 gap-4 text-center">
      {[
        { icon: '🔗', label: 'Connect Wallet', desc: 'Use Freighter' },
        { icon: '💰', label: 'View Balance', desc: 'Real-time XLM' },
        { icon: '⚡', label: 'Send XLM', desc: 'Instant on Testnet' },
      ].map((step, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <span className="text-2xl">{step.icon}</span>
          <p className="text-xs font-medium text-gray-300">{step.label}</p>
          <p className="text-xs text-gray-600">{step.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

// ─── FOOTER ───────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer className="relative z-10 text-center py-8 px-4">
    <div className="flex items-center justify-center gap-4 mb-3">
      <a
        href="https://stellar.org"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
      >
        Stellar.org
      </a>
      <span className="text-gray-700">·</span>
      <a
        href="https://stellar.expert/explorer/testnet"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
      >
        Testnet Explorer
      </a>
      <span className="text-gray-700">·</span>
      <a
        href="https://friendbot.stellar.org"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
      >
        Friendbot
      </a>
    </div>
    <p className="text-xs text-gray-700">
      Built on the Stellar Network · Testnet only · No real funds
    </p>
  </footer>
);

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function Home() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleConnect = useCallback((key: string) => {
    setPublicKey(key);
  }, []);

  const handleDisconnect = useCallback(() => {
    setPublicKey(null);
    setRefreshTrigger(0);
  }, []);

  const handleTransactionSuccess = useCallback(() => {
    // Increment trigger to force BalanceCard to refresh
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const isConnected = !!publicKey;

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background stars */}
      <StarField />

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <Header isConnected={isConnected} />

        {/* Main content */}
        <main className="flex-1 max-w-lg mx-auto w-full px-4 pb-8">
          <div className="space-y-4">
            {/* 1. Wallet Connect */}
            <WalletConnect
              publicKey={publicKey}
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
            />

            {/* 2. Balance & Send — only shown when connected */}
            {isConnected && publicKey ? (
              <>
                <BalanceCard
                  publicKey={publicKey}
                  refreshTrigger={refreshTrigger}
                />
                <SendForm
                  senderPublicKey={publicKey}
                  onTransactionSuccess={handleTransactionSuccess}
                />
              </>
            ) : (
              <NotConnectedHero />
            )}
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
