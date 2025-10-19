import { useState, useEffect } from 'react';

interface UserStats {
  address: string;
  correctAnswers: number;
  totalAnswered: number;
  tokensEarned: number;
  powerUpsUsed: number;
}

interface LeaderboardProps {
  stats: UserStats[];
  currentUserAddress?: string;
}

export default function Leaderboard({ stats, currentUserAddress }: LeaderboardProps) {
  const [sortedStats, setSortedStats] = useState<UserStats[]>([]);
  const [sortBy, setSortBy] = useState<'tokens' | 'accuracy'>('tokens');

  useEffect(() => {
    const sorted = [...stats].sort((a, b) => {
      if (sortBy === 'tokens') {
        return b.tokensEarned - a.tokensEarned;
      } else {
        const accuracyA = a.totalAnswered > 0 ? (a.correctAnswers / a.totalAnswered) * 100 : 0;
        const accuracyB = b.totalAnswered > 0 ? (b.correctAnswers / b.totalAnswered) * 100 : 0;
        return accuracyB - accuracyA;
      }
    });
    setSortedStats(sorted);
  }, [stats, sortBy]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const calculateAccuracy = (correct: number, total: number) => {
    if (total === 0) return 0;
    return ((correct / total) * 100).toFixed(1);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Leaderboard</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('tokens')}
            className={`px-4 py-2 rounded-lg ${
              sortBy === 'tokens'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tokens
          </button>
          <button
            onClick={() => setSortBy('accuracy')}
            className={`px-4 py-2 rounded-lg ${
              sortBy === 'accuracy'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Accuracy
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-3 text-left">Rank</th>
              <th className="py-3 text-left">Player</th>
              <th className="py-3 text-right">Correct</th>
              <th className="py-3 text-right">Total</th>
              <th className="py-3 text-right">Accuracy</th>
              <th className="py-3 text-right">Tokens</th>
              <th className="py-3 text-right">Power-ups</th>
            </tr>
          </thead>
          <tbody>
            {sortedStats.map((user, index) => (
              <tr
                key={user.address}
                className={`border-b border-gray-100 ${
                  user.address === currentUserAddress ? 'bg-blue-50' : ''
                }`}
              >
                <td className="py-4">#{index + 1}</td>
                <td className="py-4">
                  {formatAddress(user.address)}
                  {user.address === currentUserAddress && (
                    <span className="ml-2 text-blue-600">(You)</span>
                  )}
                </td>
                <td className="py-4 text-right">{user.correctAnswers}</td>
                <td className="py-4 text-right">{user.totalAnswered}</td>
                <td className="py-4 text-right">
                  {calculateAccuracy(user.correctAnswers, user.totalAnswered)}%
                </td>
                <td className="py-4 text-right">{user.tokensEarned}</td>
                <td className="py-4 text-right">{user.powerUpsUsed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedStats.length === 0 && (
        <p className="text-center text-gray-500 mt-4">
          No players yet. Be the first to join!
        </p>
      )}
    </div>
  );
}
