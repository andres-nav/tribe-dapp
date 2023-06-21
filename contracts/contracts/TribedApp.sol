// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ITribedApp.sol";
import "./ITribedAppErrors.sol";

contract TribeDapp is Ownable, ERC1155, ITribeDapp, ITribedAppErrors {

    struct Tribe {
	address owner;
	uint256 priceToJoin;
	uint256 maxCapacity;
	uint256 capacity;
	string uri;
    }

    // Mapping from token ID to tribes
    mapping(uint256 => Tribe) private _tribes;

    uint256 private _priceNewTribe;
    uint256 private _maxId;

    constructor (uint256 priceNewTribe) ERC1155() {
	_priceNewTribe = priceNewTribe;
	_maxId = 0;
    }

    modifier tribeExists(uint256 id) {
	require(_tribes[id] != 0);
	_;
    }

    modifier onlyTribeOwner(uint256 id) {
	require(msg.sender == _tribes[id].owner);
	_;
    }

    function tribes() public view {
	return _tribes;
    }

    function setPriceNewTribe(uint256 priceNewTribe) public onlyOwner {
	_priceNewTribe = priceNewTribe;
    }

    function priceNewTribe() public view {
	return _priceNewTribe;
    }

    function createTribe(uint256 priceToJoin, uint256 maxCapacity, string memory uri) public payable {
	if (msg.value != _priceNewTribe) {
	    revert TribedAppWrongPayment(msg.value, _priceNewTribe);
	}

	_maxId++;

	_tribes[_maxId] = Tribe(msg.sender, priceToJoin, maxCapacity, 0, uri); 

	emit EditTribe(_maxId);
    }

    function deleteTribe(uint256 id) public tribeExists(id) onlyTribeOwner(id) {
	_tribe[id] = 0;

	emit EditTribe(id);
    }

    function setOwnershipToTribe(uint256 id, address newOwner) public tribeExists(id) onlyTribeOwner(id) {
	_tribe[id].owner = newOwner;

	emit EditTribe(id);
    }

    function setPriceToJoinToTribe(uint256 id, uint256 newPriceToJoin) public tribeExists(id) onlyTribeOwner(id) {
	_tribe[id].priceToJoin = newPriceToJoin;

	emit EditTribe(id);
    }

    function setMaxCapacityToTribe(uint256 id, uint256 newMaxCapacity) public tribeExists(id) onlyTribeOwner(id) {
	Tribe memory tribe = _tribe[id];
	if (tribe.capacity > newMaxCapacity) {
	    revert TribedAppMaxCapacitySmall(tribe.capacity, newMaxCapacity); 
	}

	tribe.maxCapacity = newMaxCapacity;
	emit EditTribe(id);
    }

    function setUriToTribe(uint256 id, string memory uri) public tribeExists(id) onlyTribeOwner(id) {
	_tribe[id].uri = uri;

	emit EditTribe(id);
    }

    function mint(uint256 id) public payable tribeExists(id) {
		
    }

    function burn(uint256 id) tribeExists(id) public {
	
    }

    function withdraw() public onlyOwner {
    }

    function withdrawTribe() public {
	
    }
}
