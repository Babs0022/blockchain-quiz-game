'use client';

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import ReownAuth from '@/components/ReownAuth';
import QuestionCard from '@/components/QuestionCard';
import Countdown from '@/components/Countdown';
import Leaderboard from '@/components/Leaderboard';

// Import contract ABIs
import QuizGameABI from '../../../artifacts/contracts/QuizGame.sol/QuizGame.json';
import QuizTokenABI from '../../../artifacts/contracts/QuizToken.sol/QuizToken.json';

interface Question {
  questionId: number;
  question: string;
  options: string[];
  endTime: number;
  isAnswered: boolean;
  isRevealed: boolean;
  correctAnswer?: string;
}

interface UserStats {
  address: string;
  correctAnswers: number;
  totalAnswered: number;
  tokensEarned: number;
  powerUpsUsed: number;
}

export default function Home() {
  const [isVerified, setIsVerified] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [userAddress, setUserAddress] = useState<string>('');
  const [quizGameContract, setQuizGameContract] = useState<ethers.Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize contracts and event listeners
  useEffect(() => {
    const init = async () => {
      try {
        if (typeof window.ethereum === 'undefined') {
          throw new Error('Please install MetaMask to use this app');
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setUserAddress(address);

        // Initialize contracts
        const quizGame = new ethers.Contract(
          process.env.NEXT_PUBLIC_QUIZ_GAME_ADDRESS!,
          QuizGameABI.abi,
          signer
        );
        setQuizGameContract(quizGame);

        // Set up event listeners
        quizGame.on('QuestionStarted', (questionId, questionHash, endTime) => {
          fetchCurrentQuestion();
        });

        quizGame.on('AnswerRevealed', (questionId, answerHash) => {
          fetchCurrentQuestion();
        });

        // Initial data fetch
        await fetchCurrentQuestion();
        await fetchLeaderboard();

        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize app');
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const fetchCurrentQuestion = async () => {
    if (!quizGameContract) return;

    try {
      const questionId = await quizGameContract.currentQuestionId();
      const question = await quizGameContract.questions(questionId);

      // In a real app, you would fetch the question text and options from IPFS or a database
      // Here we're using mock data for demonstration
      setCurrentQuestion({
        questionId: questionId,
        question: "What is the capital of France?",
        options: ["London", "Paris", "Berlin", "Madrid"],
        endTime: question.endTime,
        isAnswered: question.hasAnswered[userAddress],
        isRevealed: question.revealed,
        correctAnswer: question.revealed ? "Paris" : undefined
      });
    } catch (err) {
      setError('Failed to fetch current question');
    }
  };

  const fetchLeaderboard = async () => {
    if (!quizGameContract) return;

    try {
      // In a real app, you would fetch this data from events or a subgraph
      // Here we're using mock data for demonstration
      setUserStats([
        {
          address: userAddress,
          correctAnswers: 5,
          totalAnswered: 8,
          tokensEarned: 50,
          powerUpsUsed: 2
        }
      ]);
    } catch (err) {
      setError('Failed to fetch leaderboard');
    }
  };

  const handleVerification = async (proof: string) => {
    if (!quizGameContract) return;

    try {
      const tx = await quizGameContract.verifyUser(proof);
      await tx.wait();
      setIsVerified(true);
    } catch (err) {
      setError('Failed to verify user');
    }
  };

  const handleAnswer = async (answerHash: string) => {
    if (!quizGameContract || !currentQuestion) return;

    try {
      const tx = await quizGameContract.submitAnswer(answerHash);
      await tx.wait();
      await fetchCurrentQuestion();
    } catch (err) {
      setError('Failed to submit answer');
    }
  };

  const handleTimeUp = useCallback(() => {
    fetchCurrentQuestion();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12">
          Blockchain Quiz Game
        </h1>

        {!isVerified ? (
          <div className="max-w-md mx-auto">
            <ReownAuth onVerified={handleVerification} />
          </div>
        ) : (
          <div className="space-y-8">
            {currentQuestion && (
              <QuestionCard
                {...currentQuestion}
                onAnswer={handleAnswer}
                onTimeUp={handleTimeUp}
              />
            )}

            <Leaderboard
              stats={userStats}
              currentUserAddress={userAddress}
            />
          </div>
        )}
      </div>
    </div>
  );
}
