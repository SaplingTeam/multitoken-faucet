// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./tokens/IERC20Mintable.sol";

contract Faucet is AccessControl {

    using SafeMath for uint256;

    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    
    struct Limit {
        uint256 maxAmount;
        uint256 period;
    }

    struct Allowance {
        uint256 periodStartTime;
        uint256 amountGiven;
    }

    mapping (address => Limit) tokenLimits;
    mapping (address => mapping(address => Allowance)) allowancesByToken;

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MANAGER_ROLE, msg.sender);
    }

    function setTokenLimit(address _token, uint256 _maxAmount, uint256 _period) public onlyRole(MANAGER_ROLE) {
         tokenLimits[_token] = Limit({
            maxAmount: _maxAmount,
            period: _period
         });
    }

    function getTokens(address token, uint256 amount) public {

        Limit storage limit = tokenLimits[token];
        Allowance storage allowance = allowancesByToken[token][msg.sender];

        if (allowance.periodStartTime <= block.timestamp - limit.period) {
            allowance.periodStartTime = block.timestamp;
            allowance.amountGiven = 0;
        }

        require(allowance.amountGiven.add(amount) <= limit.maxAmount);
        allowance.amountGiven = allowance.amountGiven.add(amount);

        IERC20Mintable(token).mint(msg.sender, amount);
    }
}