import { useState, useEffect, useCallback } from 'react';

interface CountdownProps {
  endTime: number;
  onTimeUp: () => void;
}

export default function Countdown({ endTime, onTimeUp }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isWarning, setIsWarning] = useState(false);

  const calculateTimeLeft = useCallback(() => {
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, endTime - now);
  }, [endTime]);

  useEffect(() => {
    // Initialize time left
    setTimeLeft(calculateTimeLeft());

    // Update timer every second
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      
      // Show warning when less than 5 seconds remain
      setIsWarning(remaining <= 5);

      // Trigger onTimeUp when countdown reaches 0
      if (remaining === 0) {
        onTimeUp();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft, onTimeUp]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="text-4xl font-bold mb-2">
        <span className={`${isWarning ? 'text-red-600 animate-pulse' : 'text-blue-600'}`}>
          {formatTime(timeLeft)}
        </span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${
            isWarning ? 'bg-red-600' : 'bg-blue-600'
          }`}
          style={{ 
            width: `${(timeLeft / 30) * 100}%`,
          }}
        />
      </div>
      <p className="text-sm text-gray-600 mt-2">
        {timeLeft > 0 ? 'Time remaining' : 'Time\'s up!'}
      </p>
    </div>
  );
}
