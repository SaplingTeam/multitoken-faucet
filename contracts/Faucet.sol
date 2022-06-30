// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./tokens/IERC20Mintable.sol";

contract Faucet is AccessControl {

    using SafeMath for uint256;

    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    struct TokenCap {
        bool isCapped;
        uint256 amountRemaining;
    }
    
    struct PeriodicLimit {
        uint256 period; //a duration in seconds
        uint256 allowancePerWallet;
    }

    struct WalletStat {
        uint256 periodStartTime;
        uint256 amountDrained;
    }

    mapping (address => address) public tokenManagers;
    mapping (address => TokenCap) public tokenCaps;
    mapping (address => PeriodicLimit) public tokenPeriodicLimits;
    mapping (address => mapping(address => WalletStat)) public statsByTokenByWallet;

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MANAGER_ROLE, msg.sender);
    }

    modifier onlyTokenManager(address token) {
        require(tokenManagers[token] == msg.sender, "Faucet: caller is not the manager of this token.");
        _;
    }

    function setTokenManager(address token, address manager) external onlyRole(DEFAULT_ADMIN_ROLE) {
        tokenManagers[token] = manager;
    }

    function transferTokenManagement(address token, address to) external onlyTokenManager(token) {
        require(to != address(0), "Faucet: Cannot transfer token management to a null address");
        tokenManagers[token] = to;
    }

    function setTokenPeriodicLimit(address _token, uint256 _allowancePerWallet, uint256 _period) external onlyTokenManager(_token) {
        tokenPeriodicLimits[_token] = PeriodicLimit({
            period: _period,
            allowancePerWallet: _allowancePerWallet
        });
    }

    function setTokenCap(address token, uint256 totalAmountDrainable) external onlyTokenManager(token) {
        tokenCaps[token] = TokenCap({
            isCapped: true,
            amountRemaining: totalAmountDrainable
        });
    }

    function unsetTokenCap(address token) external onlyTokenManager(token) {
        TokenCap storage cap = tokenCaps[token];
        cap.isCapped = false;
        cap.amountRemaining= 0;
    }

    function getTokens(address token, uint256 amount) external {
        TokenCap storage cap = tokenCaps[token];
        require(!cap.isCapped || amount <= cap.amountRemaining, "Faucet: requested amount is not available.");

        PeriodicLimit storage limit = tokenPeriodicLimits[token];
        WalletStat storage stat = statsByTokenByWallet[token][msg.sender];

        if (stat.periodStartTime.add(limit.period) <= block.timestamp) {
            stat.periodStartTime = block.timestamp;
            stat.amountDrained = 0;
        }

        require(stat.amountDrained.add(amount) <= limit.allowancePerWallet);
        stat.amountDrained = stat.amountDrained.add(amount);

        if (cap.isCapped) {
            cap.amountRemaining = cap.amountRemaining.sub(amount);
        }

        IERC20Mintable(token).mint(msg.sender, amount);
    }

    function currentAllowance(address token, address wallet) external view returns (uint256) {
        
        PeriodicLimit storage limit = tokenPeriodicLimits[token];
        WalletStat storage stat = statsByTokenByWallet[token][wallet];

        if (stat.amountDrained >= limit.allowancePerWallet) {
            return 0;
        }

        uint256 walletAllowance;
        if (stat.periodStartTime.add(limit.period) <= block.timestamp) {
            walletAllowance = limit.allowancePerWallet;
        } else {
            walletAllowance = limit.allowancePerWallet.sub(stat.amountDrained);
        }

        TokenCap storage cap = tokenCaps[token];
        if (cap.isCapped) {
            return Math.min(walletAllowance, cap.amountRemaining);
        }

        return walletAllowance;
    }
}
