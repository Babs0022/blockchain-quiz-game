import { useState, useCallback } from 'react';
import { useReownClient } from '@reclaim/client';

interface ReownAuthProps {
  onVerified: (proof: string) => void;
}

export default function ReownAuth({ onVerified }: ReownAuthProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reownClient = useReownClient();

  const handleVerification = useCallback(async () => {
    try {
      setIsVerifying(true);
      setError(null);

      // Initialize Reown verification
      const proof = await reownClient.verify({
        title: "Quiz Game Verification",
        description: "Verify your identity to participate in the quiz game",
        callbackUrl: window.location.origin,
      });

      onVerified(proof);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  }, [onVerified, reownClient]);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Verify Your Identity</h2>
      <p className="text-gray-600 mb-6 text-center">
        To participate in the quiz game, please verify your identity using Reown.
        This helps prevent cheating and ensures fair gameplay.
      </p>

      <button
        onClick={handleVerification}
        disabled={isVerifying}
        className={`px-6 py-3 rounded-lg text-white font-semibold transition-colors ${
          isVerifying
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isVerifying ? 'Verifying...' : 'Verify with Reown'}
      </button>

      {error && (
        <p className="mt-4 text-red-600 text-center">
          {error}
        </p>
      )}

      <div className="mt-6 text-sm text-gray-500">
        <p>Why verify with Reown?</p>
        <ul className="list-disc list-inside mt-2">
          <li>Prevent multiple accounts (Sybil resistance)</li>
          <li>Ensure fair competition</li>
          <li>Protect reward distribution</li>
        </ul>
      </div>
    </div>
  );
}
