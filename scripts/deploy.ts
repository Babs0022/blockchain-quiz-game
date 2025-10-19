import { ethers } from "hardhat";
import { verify } from "./verify";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy QuizToken
  const QuizToken = await ethers.getContractFactory("QuizToken");
  const quizToken = await QuizToken.deploy();
  await quizToken.waitForDeployment();
  const quizTokenAddress = await quizToken.getAddress();
  console.log("QuizToken deployed to:", quizTokenAddress);

  // Deploy QuizGame
  const QuizGame = await ethers.getContractFactory("QuizGame");
  const quizGame = await QuizGame.deploy(quizTokenAddress);
  await quizGame.waitForDeployment();
  const quizGameAddress = await quizGame.getAddress();
  console.log("QuizGame deployed to:", quizGameAddress);

  // Transfer ownership of QuizToken to QuizGame
  const tx = await quizToken.transferOwnership(quizGameAddress);
  await tx.wait();
  console.log("QuizToken ownership transferred to QuizGame");

  // Verify contracts on Etherscan
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("Verifying contracts on Etherscan...");
    await verify(quizTokenAddress, []);
    await verify(quizGameAddress, [quizTokenAddress]);
    console.log("Contracts verified on Etherscan");
  }

  console.log("Deployment completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
