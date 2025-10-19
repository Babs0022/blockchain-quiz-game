// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract QuizToken is ERC20, Ownable {
    uint256 public constant REWARD_AMOUNT = 10 * 10**18; // 10 tokens with 18 decimals
    
    constructor() ERC20("Quiz Token", "QUIZ") Ownable(msg.sender) {
        // Mint initial supply to the owner
        _mint(msg.sender, 1000000 * 10**18); // 1 million tokens
    }
    
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    function burnAndMint(address from, address to, uint256 amount) external onlyOwner {
        _burn(from, amount);
        _mint(to, amount);
    }
    
    function decimals() public pure override returns (uint8) {
        return 18;
    }
}
