# Blockchain Quiz Game

A decentralized quiz game built on Ethereum where players can participate in timed multiple-choice questions and earn tokens for correct answers. Features Reown authentication for sybil resistance and a real-time leaderboard.

## Features

- 30-second timed questions
- Reown authentication for sybil resistance
- Automatic token rewards for correct answers
- Real-time leaderboard
- Power-up system
- Fair gameplay with one answer per round

## Tech Stack

- Solidity (Smart Contracts)
- Hardhat (Development Framework)
- Next.js (Frontend)
- TypeScript
- TailwindCSS
- Ethers.js
- Reown Protocol

## Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- MetaMask wallet
- Alchemy API key
- Etherscan API key
- Reown API credentials

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd blockchain-quiz-game
```

2. Install dependencies:
```bash
npm install
```

3. Create environment files:

Create `.env` in the root directory:
```
ALCHEMY_API_KEY=your_alchemy_api_key
PRIVATE_KEY=your_wallet_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key
```

Create `frontend/.env.local`:
```
NEXT_PUBLIC_QUIZ_GAME_ADDRESS=your_deployed_quiz_game_contract_address
NEXT_PUBLIC_QUIZ_TOKEN_ADDRESS=your_deployed_quiz_token_contract_address
NEXT_PUBLIC_RECLAIM_APP_ID=your_reclaim_app_id
NEXT_PUBLIC_RECLAIM_API_KEY=your_reclaim_api_key
NEXT_PUBLIC_NETWORK_ID=11155111
NEXT_PUBLIC_NETWORK_NAME=Sepolia
NEXT_PUBLIC_NETWORK_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_alchemy_api_key
```

## Smart Contract Deployment

1. Compile contracts:
```bash
npm run compile
```

2. Deploy to local network:
```bash
npm run deploy:local
```

3. Deploy to Sepolia testnet:
```bash
npm run deploy:sepolia
```

4. Verify contracts on Etherscan:
```bash
npm run verify:sepolia
```

## Frontend Development

1. Install frontend dependencies:
```bash
cd frontend
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Project Structure

```
blockchain-quiz-game/
├── contracts/
│   ├── QuizToken.sol       # ERC20 token for rewards
│   └── QuizGame.sol        # Main game logic
├── frontend/
│   ├── components/
│   │   ├── QuestionCard.tsx
│   │   ├── Countdown.tsx
│   │   ├── Leaderboard.tsx
│   │   └── ReownAuth.tsx
│   ├── pages/
│   │   └── index.tsx
│   └── styles/
│       └── main.css
├── scripts/
│   ├── deploy.ts
│   └── verify.ts
└── test/
    └── QuizGame.test.ts
```

## Smart Contract Architecture

### QuizToken
- ERC20 token for rewards
- Initial supply: 1 million tokens
- Reward amount: 10 tokens per correct answer

### QuizGame
- Question management with 30-second intervals
- Reown authentication for sybil resistance
- Answer submission with duplicate prevention
- Automated reward distribution
- Power-up system
- Leaderboard tracking

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT
