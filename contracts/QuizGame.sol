// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./QuizToken.sol";

contract QuizGame is Ownable, ReentrancyGuard, Pausable {
    struct Question {
        bytes32 questionHash; // Hash of the question text and options
        bytes32 answerHash; // Hash of the correct answer
        uint256 endTime; // When this question expires
        bool revealed; // Whether the answer has been revealed
        mapping(address => bool) hasAnswered; // Track who has answered
        mapping(address => bytes32) userAnswers; // Store user answers
    }

    struct UserStats {
        uint256 correctAnswers;
        uint256 totalAnswered;
        uint256 powerUpsUsed;
        uint256 tokensEarned;
    }

    // State variables
    QuizToken public immutable quizToken;
    uint256 public constant QUESTION_INTERVAL = 30 seconds;
    uint256 public constant REWARD_AMOUNT = 10 * 10**18; // 10 tokens
    uint256 public currentQuestionId;
    
    mapping(uint256 => Question) public questions;
    mapping(address => UserStats) public userStats;
    mapping(address => bool) public verifiedUsers; // Reown verified users
    mapping(address => uint256) public powerUps;
    
    // Events
    event QuestionStarted(uint256 indexed questionId, bytes32 questionHash, uint256 endTime);
    event AnswerSubmitted(uint256 indexed questionId, address indexed user);
    event AnswerRevealed(uint256 indexed questionId, bytes32 answerHash);
    event RewardDistributed(uint256 indexed questionId, address indexed user, uint256 amount);
    event UserVerified(address indexed user);
    event PowerUpUsed(address indexed user, uint256 indexed questionId, uint8 powerUpType);

    constructor(address _tokenAddress) Ownable(msg.sender) {
        quizToken = QuizToken(_tokenAddress);
    }

    // Verify user through Reown
    function verifyUser(bytes calldata proof) external {
        // TODO: Implement Reown verification logic
        require(!verifiedUsers[msg.sender], "Already verified");
        verifiedUsers[msg.sender] = true;
        emit UserVerified(msg.sender);
    }

    // Start a new question
    function startNewQuestion(bytes32 _questionHash, bytes32 _answerHash) external onlyOwner {
        require(_questionHash != bytes32(0), "Invalid question hash");
        require(_answerHash != bytes32(0), "Invalid answer hash");
        
        currentQuestionId++;
        Question storage q = questions[currentQuestionId];
        q.questionHash = _questionHash;
        q.answerHash = _answerHash;
        q.endTime = block.timestamp + QUESTION_INTERVAL;
        q.revealed = false;
        
        emit QuestionStarted(currentQuestionId, _questionHash, q.endTime);
    }

    // Submit answer for current question
    function submitAnswer(bytes32 _answerHash) external nonReentrant whenNotPaused {
        require(verifiedUsers[msg.sender], "User not verified");
        require(currentQuestionId > 0, "No active question");
        
        Question storage q = questions[currentQuestionId];
        require(block.timestamp < q.endTime, "Question expired");
        require(!q.hasAnswered[msg.sender], "Already answered");
        
        q.hasAnswered[msg.sender] = true;
        q.userAnswers[msg.sender] = _answerHash;
        userStats[msg.sender].totalAnswered++;
        
        emit AnswerSubmitted(currentQuestionId, msg.sender);
    }

    // Reveal answer and distribute rewards
    function revealAnswer() external onlyOwner {
        require(currentQuestionId > 0, "No question to reveal");
        Question storage q = questions[currentQuestionId];
        require(block.timestamp >= q.endTime, "Question still active");
        require(!q.revealed, "Answer already revealed");
        
        q.revealed = true;
        emit AnswerRevealed(currentQuestionId, q.answerHash);

        // Distribute rewards to correct answers
        // Implementation in distributeRewards function
        distributeRewards(currentQuestionId);
    }

    // Distribute rewards to correct answers
    function distributeRewards(uint256 _questionId) internal {
        Question storage q = questions[_questionId];
        bytes32 correctAnswer = q.answerHash;
        
        // Iterate through participants and reward correct answers
        // Note: In production, consider implementing a more gas-efficient reward distribution
        for (uint256 i = 0; i < verifiedUsers.length; i++) {
            address user = verifiedUsers[i];
            if (q.hasAnswered[user] && q.userAnswers[user] == correctAnswer) {
                quizToken.mint(user, REWARD_AMOUNT);
                userStats[user].correctAnswers++;
                userStats[user].tokensEarned += REWARD_AMOUNT;
                emit RewardDistributed(_questionId, user, REWARD_AMOUNT);
            }
        }
    }

    // Power-up functions
    function usePowerUp(uint8 powerUpType, uint256 _questionId) external nonReentrant whenNotPaused {
        require(verifiedUsers[msg.sender], "User not verified");
        require(powerUps[msg.sender] > 0, "No power-ups available");
        require(powerUpType < 3, "Invalid power-up type");
        
        powerUps[msg.sender]--;
        userStats[msg.sender].powerUpsUsed++;
        
        // Implement power-up effects
        if (powerUpType == 0) {
            // Extra time
            questions[_questionId].endTime += 5 seconds;
        } else if (powerUpType == 1) {
            // Hint (implemented in front-end)
        } else if (powerUpType == 2) {
            // Double points for next correct answer
        }
        
        emit PowerUpUsed(msg.sender, _questionId, powerUpType);
    }

    // Admin functions
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
