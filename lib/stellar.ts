/**
 * stellar.ts
 * Utilities for interacting with the Stellar Testnet via Horizon
 * and building/submitting payment transactions.
 */

import * as StellarSdk from '@stellar/stellar-sdk';

// ─── NETWORK CONFIG ────────────────────────────────────────────────────────────
export const HORIZON_URL = 'https://horizon-testnet.stellar.org';
export const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;

const server = new StellarSdk.Horizon.Server(HORIZON_URL);

// ─── TYPES ─────────────────────────────────────────────────────────────────────
export type StellarBalance = {
  xlm: string;
  raw: number;
};

export type TransactionResult = {
  success: boolean;
  hash?: string;
  error?: string;
};

// ─── BALANCE ──────────────────────────────────────────────────────────────────
/**
 * Fetches the XLM balance for a given Stellar public key.
 */
export async function getXLMBalance(publicKey: string): Promise<StellarBalance> {
  try {
    const account = await server.loadAccount(publicKey);
    const xlmBalance = account.balances.find(
      (b) => b.asset_type === 'native'
    );
    const raw = parseFloat(xlmBalance?.balance ?? '0');
    return {
      xlm: raw.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 7,
      }),
      raw,
    };
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('404')) {
      throw new Error('Account not found on Testnet. Fund it at friendbot first.');
    }
    throw new Error(`Failed to load balance: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}

// ─── TRANSACTION ──────────────────────────────────────────────────────────────
/**
 * Builds a Stellar payment XDR ready to be signed by Freighter.
 */
export async function buildPaymentTransaction(
  senderPublicKey: string,
  recipientAddress: string,
  amountXLM: string
): Promise<string> {
  // Validate recipient address
  try {
    StellarSdk.Keypair.fromPublicKey(recipientAddress);
  } catch {
    throw new Error('Invalid recipient address. Please check and try again.');
  }

  // Validate amount
  const amount = parseFloat(amountXLM);
  if (isNaN(amount) || amount <= 0) {
    throw new Error('Invalid amount. Please enter a positive number.');
  }
  if (amount < 0.0000001) {
    throw new Error('Amount is below the minimum transaction size.');
  }

  // Load sender account
  let sourceAccount: StellarSdk.AccountResponse;
  try {
    sourceAccount = await server.loadAccount(senderPublicKey);
  } catch {
    throw new Error('Could not load sender account. Make sure your wallet is funded on Testnet.');
  }

  // Build transaction
  const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination: recipientAddress,
        asset: StellarSdk.Asset.native(),
        amount: amount.toFixed(7),
      })
    )
    .setTimeout(30)
    .build();

  return transaction.toXDR();
}

/**
 * Submits a signed XDR transaction to the Stellar Testnet.
 */
export async function submitTransaction(signedXDR: string): Promise<TransactionResult> {
  try {
    const transaction = StellarSdk.TransactionBuilder.fromXDR(
      signedXDR,
      NETWORK_PASSPHRASE
    );
    const response = await server.submitTransaction(transaction);
    return {
      success: true,
      hash: response.hash,
    };
  } catch (err: unknown) {
    let errorMessage = 'Transaction failed. Please try again.';

    if (err && typeof err === 'object' && 'response' in err) {
      const horizonErr = err as { response: { data: { extras?: { result_codes?: { operations?: string[] } } } } };
      const ops = horizonErr.response?.data?.extras?.result_codes?.operations;
      if (ops?.includes('op_underfunded')) {
        errorMessage = 'Insufficient balance to complete this transaction.';
      } else if (ops?.includes('op_no_destination')) {
        errorMessage = 'Recipient account does not exist on Testnet.';
      } else if (ops?.includes('op_bad_auth')) {
        errorMessage = 'Transaction authorization failed.';
      }
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
/**
 * Truncates a Stellar address to GABC...WXYZ format.
 */
export function truncateAddress(address: string, chars = 4): string {
  if (!address || address.length < chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

/**
 * Returns the Stellar Expert URL for a transaction hash.
 */
export function getTxExplorerUrl(hash: string): string {
  return `https://stellar.expert/explorer/testnet/tx/${hash}`;
}

/**
 * Validates a Stellar public key format.
 */
export function isValidStellarAddress(address: string): boolean {
  try {
    StellarSdk.Keypair.fromPublicKey(address);
    return true;
  } catch {
    return false;
  }
}
