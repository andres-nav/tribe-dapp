// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface ITribeDappErrors {

    error WrongPayment(uint256 payment, uint256 price);
    error WrongFee(uint8 fee);
    error MaxCapacitySmall(uint256 capacity, uint256 newMaxCapacity);
    error TribeDoesNotExist(uint256 id);
    error TribeFull(uint256 id);
    error NotInTribe(address account, uint256 id);
    error InTribe(address account, uint256 id);
    error IsNotTribeOwner(address account, address owner);
    
}
