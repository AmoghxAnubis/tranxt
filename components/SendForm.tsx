'use client';

import React, { useState, useCallback } from 'react';
import {
  buildPaymentTransaction,
  submitTransaction,
  isValidStellarAddress,
  getTxExplorerUrl,
} from '@/lib/stellar';

interface SendFormProps {
  senderPublicKey: string;
  onTransactionSuccess: () => void;
}

type TxStatus = 'idle' | 'building' | 'signing' | 'submitting' | 'success' | 'error';

export default function SendForm({ senderPublicKey, onTransactionSuccess }: SendFormProps) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [txStatus, setTxStatus] = useState<TxStatus>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Live validation
  const isValidRecipient = recipient.length > 0 && isValidStellarAddress(recipient);
  const isValidAmount = !isNaN(parseFloat(amount)) && parseFloat(amount) > 0;
  const canSend = isValidRecipient && isValidAmount && txStatus === 'idle';

  const getStatusLabel = (s: TxStatus) => {
    switch (s) {
      case 'building': return 'Building transaction...';
      case 'signing': return 'Waiting for signature...';
      case 'submitting': return 'Submitting to network...';
      default: return '';
    }
  };

  const handleSend = useCallback(async () => {
    if (!canSend) return;

    setTxStatus('building');
    setErrorMsg(null);
    setTxHash(null);

    try {
      // Step 1: Build XDR
      const xdr = await buildPaymentTransaction(senderPublicKey, recipient, amount);

      // Step 2: Sign with Freighter (v6 API)
      setTxStatus('signing');
      const freighter = await import('@stellar/freighter-api');
      // v6: signTransaction(xdr, opts) — positional, NOT { xdr, ... }
      // 'network' exists at runtime in Freighter v6 but isn't in the TS types yet
      const signResult = await freighter.signTransaction(xdr, {
        networkPassphrase: 'Test SDF Network ; September 2015',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      if (!signResult || signResult.error) {
        // Freighter v6 can return error as object, string, or undefined — always coerce to string
        const rawErr = signResult?.error;
        const errMsg = rawErr
          ? (typeof rawErr === 'string' ? rawErr : JSON.stringify(rawErr))
          : '';
        const errLower = errMsg.toLowerCase();
        if (errLower.includes('declined') || errLower.includes('rejected') || errLower.includes('cancel')) {
          throw new Error('Transaction was cancelled in Freighter. Please approve to proceed.');
        }
        throw new Error(errMsg || 'Freighter did not sign the transaction. Please try again.');
      }

      if (!signResult.signedTxXdr) {
        throw new Error('Freighter did not return a signed transaction. Please try again.');
      }

      // Step 3: Submit
      setTxStatus('submitting');
      const result = await submitTransaction(signResult.signedTxXdr);

      if (result.success && result.hash) {
        setTxHash(result.hash);
        setTxStatus('success');
        // Clear inputs
        setRecipient('');
        setAmount('');
        // Trigger balance refresh
        onTransactionSuccess();
      } else {
        throw new Error(result.error ?? 'Transaction failed');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unexpected error. Please try again.');
      setTxStatus('error');
    }
  }, [canSend, senderPublicKey, recipient, amount, onTransactionSuccess]);

  const handleReset = () => {
    setTxStatus('idle');
    setErrorMsg(null);
    setTxHash(null);
  };

  const isProcessing = ['building', 'signing', 'submitting'].includes(txStatus);

  return (
    <div className="glass-card p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-stellar-600/15 border border-stellar-500/25 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M22 2L11 13"
              stroke="#0e8fe7"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M22 2L15 22L11 13L2 9L22 2Z"
              stroke="#0e8fe7"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Send XLM</h2>
          <p className="text-xs text-gray-500 mt-0.5">Stellar Testnet · No fees</p>
        </div>
      </div>

      {/* Success State */}
      {txStatus === 'success' && txHash && (
        <div className="success-box mb-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 6L9 17L4 12"
                  stroke="#10d98a"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-green-400 font-semibold text-sm mb-1">Transaction Successful! 🎉</p>
              <p className="text-gray-400 text-xs mb-2">Your XLM has been sent on Testnet.</p>
              <div className="bg-black/30 rounded-lg p-2.5 border border-green-500/10">
                <p className="text-gray-500 text-xs mb-1 uppercase tracking-wider font-medium">Tx Hash</p>
                <a
                  id="tx-hash-link"
                  href={getTxExplorerUrl(txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hash-link"
                >
                  {txHash}
                </a>
              </div>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="w-full mt-4 py-2 px-4 rounded-lg text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/20 transition-all"
          >
            Send Another Transaction
          </button>
        </div>
      )}

      {/* Error State */}
      {txStatus === 'error' && errorMsg && (
        <div className="error-box mb-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 8V12M12 16H12.01"
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                  stroke="#ef4444"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <div>
              <p className="text-red-400 font-semibold text-sm mb-1">Transaction Failed</p>
              <p className="text-gray-400 text-xs">{errorMsg}</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="w-full mt-4 py-2 px-4 rounded-lg text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/20 transition-all"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Form — hide on success */}
      {txStatus !== 'success' && (
        <div className="space-y-4">
          {/* Recipient */}
          <div>
            <label htmlFor="recipient-input" className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
              Recipient Address
            </label>
            <div className="relative">
              <input
                id="recipient-input"
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value.trim())}
                placeholder="GABC...XYZ"
                disabled={isProcessing}
                className="stellar-input pr-10"
                autoComplete="off"
                spellCheck={false}
              />
              {/* Validation indicator */}
              {recipient.length > 0 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isValidRecipient ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17L4 12" stroke="#10d98a" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <span className="text-red-400 text-xs">✗</span>
                  )}
                </div>
              )}
            </div>
            {recipient.length > 0 && !isValidRecipient && (
              <p className="text-red-400/80 text-xs mt-1 ml-1">Invalid Stellar address format</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount-input" className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
              Amount (XLM)
            </label>
            <div className="relative">
              <input
                id="amount-input"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0.0000001"
                step="0.01"
                disabled={isProcessing}
                className="stellar-input pr-16"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-mono font-medium">
                XLM
              </span>
            </div>
          </div>

          {/* Processing status */}
          {isProcessing && (
            <div className="rounded-xl bg-stellar-600/10 border border-stellar-500/20 p-3 flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-stellar-500/30 border-t-stellar-500 animate-spin flex-shrink-0" />
              <p className="text-stellar-400 text-sm">{getStatusLabel(txStatus)}</p>
            </div>
          )}

          {/* Send Button */}
          <button
            id="btn-send"
            onClick={handleSend}
            disabled={!canSend || isProcessing}
            className="btn-primary flex items-center justify-center gap-2 mt-2"
          >
            {isProcessing ? (
              <>
                <span className="spinner" />
                Processing...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Send XLM
              </>
            )}
          </button>

          {/* Testnet notice */}
          <p className="text-xs text-gray-600 text-center mt-2">
            ⚡ Testnet only — no real value transferred
          </p>
        </div>
      )}
    </div>
  );
}
