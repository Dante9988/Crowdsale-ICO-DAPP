
// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.24;

import './Token.sol';

contract Crowdsale {

    string public name = "Crowdsale";
    Token public token;
    uint256 public price;
    uint256 public tokensSold;
    uint256 public maxTokens;

    event Buy(uint256 amount, address buyer);

    constructor(Token _token, uint256 _price, uint256 _maxTokens) {
        token = _token;
        price = _price;
        maxTokens = _maxTokens;
    }

    function buyTokens(uint256 _amount) public payable {
        require(msg.value == (_amount / 1e18) * price);
        require(token.balanceOf(address(this)) >= _amount, 'balance in Contract is not enough.');
        require(token.transfer(msg.sender, _amount), 'Failed to transfer tokens.');

        tokensSold += _amount;
        maxTokens -= _amount;
        
        emit Buy(_amount, msg.sender);
        
    }
    
}
