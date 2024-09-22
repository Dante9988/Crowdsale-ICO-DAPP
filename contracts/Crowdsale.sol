
// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.24;

import './Token.sol';

contract Crowdsale {

    address public owner;
    Token public token;
    uint256 public price;
    uint256 public tokensSold;
    uint256 public maxTokens;
    mapping (address => bool) public whitelisted;

    event Buy(uint256 amount, address buyer);
    event Finalize(uint256 tokensSold, uint256 ethRaised);
    event Whitelist(address addressToWhitelist);
    event RemoveWhitelist(address addressToRemove);

    constructor(Token _token, uint256 _price, uint256 _maxTokens) {
        token = _token;
        price = _price;
        maxTokens = _maxTokens;
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, 'Caller must be owner');
        _;
    }

    function buyTokens(uint256 _amount) public payable {
        require(whitelisted[msg.sender] == true, 'Not Whitelisted.');
        require(msg.value == (_amount / 1e18) * price, 'This one??');
        require(token.balanceOf(address(this)) >= _amount, 'balance in Contract is not enough.');
        require(token.transfer(msg.sender, _amount), 'Failed to transfer tokens.');

        tokensSold += _amount;
        maxTokens -= _amount;

        emit Buy(_amount, msg.sender);
    }

    receive() external payable {
        uint256 amount = msg.value / price;
        buyTokens(amount * 1e18);
    }

    function setPrice(uint256 _price) public onlyOwner {
        price = _price;
    }

    function finalize() public onlyOwner {
        require(token.transfer(owner,  token.balanceOf(address(this))));
        
        uint256 value = address(this).balance;
        (bool sent,) = owner.call{value: value}('');
        require(sent);
        
        emit Finalize(tokensSold, value);
    } 

    function addToWhitelist(address addressToWhitelist) public onlyOwner {
        whitelisted[addressToWhitelist] = true;
        emit Whitelist(addressToWhitelist);
    }

    function removeFromWhitelist(address addressToRemove) public onlyOwner {
        whitelisted[addressToRemove] = false;
        emit RemoveWhitelist(addressToRemove);
    }
}
