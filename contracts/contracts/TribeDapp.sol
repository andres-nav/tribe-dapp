// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ITribeDapp.sol";
import "./ITribeDappErrors.sol";

contract TribeDapp is Ownable, ERC1155, ITribeDapp, ITribeDappErrors {

    struct Tribe {
	address owner;
	uint256 priceToJoin;
	uint256 maxCapacity;
	uint256 capacity;
	string uri;
	uint256 balanceTribe;
    }

    // Mapping from token ID to tribes
    mapping(uint256 => Tribe) private _tribes;

    uint256 private _priceNewTribe;
    uint256 private _maxId;
    
    uint8 private _feeIn100;
    uint256 private _balanceContract;

    modifier tribeExists(uint256 id) {
	if (_isTribeEmpty(id)) {
	    revert TribeDoesNotExist(id);
	}
	_;
    }

    modifier tribesExist(uint256[] memory ids) {
        for (uint256 i = 0; i < ids.length; ++i) {
	    if (_isTribeEmpty(ids[i])) {
		revert TribeDoesNotExist(ids[i]);
	    }
        }
	_;
    }

    modifier onlyTribeOwner(uint256 id) {
	if(msg.sender != _tribes[id].owner) {
	    revert IsNotTribeOwner(msg.sender, _tribes[id].owner);
	}
	_;
    }


    modifier notInTribe(address account, uint256 id) {
	if (balanceOf(account, id) != 0) {
	    revert InTribe(account, id);
	}
	_;
    }

    modifier notInTribes(address account, uint256[] memory ids) {
        for (uint256 i = 0; i < ids.length; ++i) {
	    if (balanceOf(account, ids[i]) != 0) {
		revert InTribe(account, ids[i]);
	    }
        }
	_;
    }

    constructor (uint256 priceNewTribe) ERC1155("") {
	_priceNewTribe = priceNewTribe;
	_maxId = 0;
    }

    function getMaxId() public view returns(uint256) {
	return _maxId;
    }

    function getPriceNewTribe() public view returns(uint256) {
	return _priceNewTribe;
    }

    function setPriceNewTribe(uint256 priceNewTribe) public onlyOwner {
	_priceNewTribe = priceNewTribe;
    }

    function _isTribeEmpty(uint256 id) internal view returns(bool) {
	return _tribes[id].owner == address(0);
    }

    function getTribe(uint256 id) public view tribeExists(id) returns(address owner, uint256 priceToJoin, uint256 maxCapacity, uint256 capacity, string memory uri, uint256 balanceTribe) {
	Tribe storage tribe = _tribes[id];
	owner = tribe.owner;
	priceToJoin = tribe.priceToJoin;
	maxCapacity = tribe.maxCapacity;
	capacity = tribe.capacity;
	uri = tribe.uri;
	balanceTribe = tribe.balanceTribe;
    }

    function createTribe(uint256 priceToJoin, uint256 maxCapacity, string memory uri) public payable returns(uint256) {
	if (msg.value != _priceNewTribe) {
	    revert WrongPayment(msg.value, _priceNewTribe);
	}

	_maxId++;

	_tribes[_maxId] = Tribe(msg.sender, priceToJoin, maxCapacity, 0, uri, 0);

	_balanceContract += msg.value;

	emit EditTribe(_maxId);

	return _maxId;
    }

    function deleteTribe(uint256 id) public tribeExists(id) onlyTribeOwner(id) {
	_tribes[id] = Tribe(address(0), 0, 0, 0, "", 0);
	emit EditTribe(id);
    }


    function setOwnershipToTribe(uint256 id, address newOwner) public tribeExists(id) onlyTribeOwner(id) {
	_tribes[id].owner = newOwner;

	emit EditTribe(id);
    }

    function setPriceToJoinToTribe(uint256 id, uint256 newPriceToJoin) public tribeExists(id) onlyTribeOwner(id) {
	_tribes[id].priceToJoin = newPriceToJoin;

	emit EditTribe(id);
    }

    function setMaxCapacityToTribe(uint256 id, uint256 newMaxCapacity) public tribeExists(id) onlyTribeOwner(id) {
	Tribe storage tribe = _tribes[id];
	if (tribe.capacity > newMaxCapacity) {
	    revert MaxCapacitySmall(tribe.capacity, newMaxCapacity); 
	}

	tribe.maxCapacity = newMaxCapacity;
	emit EditTribe(id);
    }

    function setUriToTribe(uint256 id, string memory uri) public tribeExists(id) onlyTribeOwner(id) {
	_tribes[id].uri = uri;

	emit EditTribe(id);
    }

    function balanceOf(address account, uint256 id) public view override (ERC1155, IERC1155) tribeExists(id) returns (uint256) {
	return super.balanceOf(account, id);
    }

    function balanceOfBatch(
        address[] memory accounts,
        uint256[] memory ids
    ) public view override (ERC1155, IERC1155) tribesExist(ids)  returns (uint256[] memory) {
	return super.balanceOfBatch(accounts, ids);
    }

    function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes memory data) public override (ERC1155, IERC1155) tribeExists(id) notInTribe(to, id) {
        super.safeTransferFrom(from, to, id, amount, data);
    }

    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public override (ERC1155, IERC1155) tribesExist(ids) notInTribes(to, ids) {
        super.safeBatchTransferFrom(from, to, ids, amounts, data);
    }

    function mint(uint256 id) public payable tribeExists(id) notInTribe(msg.sender, id) {
	Tribe storage tribe = _tribes[id];
	if (tribe.capacity >= tribe.maxCapacity) {
	    revert TribeFull(id);
	}

	if (msg.value != tribe.priceToJoin) {
	    revert WrongPayment(msg.value, tribe.priceToJoin);
	}

	uint256 fee = msg.value * _feeIn100 / 100;
	_balanceContract += fee;
	tribe.balanceTribe += (msg.value - fee);

	_mint(msg.sender, id, 1, "");
	tribe.capacity++;
    }

    function burn(uint256 id) public tribeExists(id) {
	_burn(msg.sender, id, 1, "");
	_tribes[id].capacity--;
    }

    function getFeeIn100() public view returns(uint256) {
	return _feeIn100;
    }

    function setFeeIn100(uint8 fee) public onlyOwner returns(uint256) {
	if (fee > 100) {
	    revert WrongFee(fee);
	}

	_feeIn100 = fee;
    }

    function getBalanceContract() public view onlyOwner returns(uint256) {
	return _balanceContract;
    }

    function withdraw() public onlyOwner {
	msg.sender.transfer(_balanceContract);
    }

    function withdrawTribe(uint256 id) public tribeExists(id) onlyTribeOwner(id) {
	Tribe storage tribe = _tribes[id];
	tribe.owner.transfer(tribe.balanceTribe);
    }
}
