import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import Countdown from './Countdown';

interface QuestionCardProps {
  questionId: number;
  question: string;
  options: string[];
  endTime: number;
  onAnswer: (answerHash: string) => Promise<void>;
  onTimeUp: () => void;
  isAnswered: boolean;
  isRevealed: boolean;
  correctAnswer?: string;
}

export default function QuestionCard({
  questionId,
  question,
  options,
  endTime,
  onAnswer,
  onTimeUp,
  isAnswered,
  isRevealed,
  correctAnswer
}: QuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (selectedOption === null) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Hash the answer before sending to the contract
      const answerHash = ethers.keccak256(
        ethers.toUtf8Bytes(options[selectedOption])
      );
      
      await onAnswer(answerHash);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit answer');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedOption, options, onAnswer]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Countdown endTime={endTime} onTimeUp={onTimeUp} />
      </div>

      <h3 className="text-xl font-semibold mb-4">
        Question #{questionId}: {question}
      </h3>

      <div className="space-y-3">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => !isAnswered && setSelectedOption(index)}
            disabled={isAnswered || isSubmitting}
            className={`w-full p-4 text-left rounded-lg transition-colors ${
              selectedOption === index
                ? 'bg-blue-100 border-blue-500'
                : 'bg-gray-50 hover:bg-gray-100'
            } ${
              isRevealed && correctAnswer === option
                ? 'bg-green-100 border-green-500'
                : ''
            } ${
              isRevealed && selectedOption === index && correctAnswer !== option
                ? 'bg-red-100 border-red-500'
                : ''
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {!isAnswered && selectedOption !== null && (
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`mt-6 w-full py-3 rounded-lg text-white font-semibold ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Answer'}
        </button>
      )}

      {error && (
        <p className="mt-4 text-red-600 text-center">
          {error}
        </p>
      )}

      {isAnswered && (
        <p className="mt-4 text-center text-gray-600">
          Your answer has been submitted. Waiting for the reveal...
        </p>
      )}

      {isRevealed && (
        <div className="mt-4 text-center">
          <p className={`font-semibold ${
            selectedOption !== null && options[selectedOption] === correctAnswer
              ? 'text-green-600'
              : 'text-red-600'
          }`}>
            {selectedOption !== null && options[selectedOption] === correctAnswer
              ? 'Correct! +10 tokens'
              : 'Incorrect. Better luck next time!'}
          </p>
        </div>
      )}
    </div>
  );
}
