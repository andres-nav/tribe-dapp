// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface ITribeDappErrors {

    error TribeDappWrongPayment(uint256 payment, uint256 price);
    error TribeDappMaxCapacitySmall(uint256 capacity, uint256 newMaxCapacity);
    error TribeDappTribeFull();
    error TribeDappNotInTheTribe();
    
}
