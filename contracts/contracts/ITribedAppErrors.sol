// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface ITribedAppErrors {

    error TribedAppWrongPayment(uint256 payment, uint256 price);
    error TribedAppMaxCapacitySmall(uint256 capacity, uint256 newMaxCapacity);
    
}
