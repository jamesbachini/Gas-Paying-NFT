// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

interface ILido is IERC20 {
  function submit(address _referral) external payable returns (uint256 StETH);
  function sharesOf(address _owner) external returns (uint balance);
}

interface ICurve {
    function exchange(int128 i, int128 j, uint256 dx, uint256 min_dy) external payable returns (uint256);
}

contract GotGas is ERC721 {
    uint32 public id;
    uint32 supply = 100;
    uint public deposits;
    ILido public stETH = ILido(0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84);
    ICurve public curve = ICurve(0xDC24316b9AE028F1497c275EB9192a3Ea0f67022);

    constructor() ERC721("GotGas", "GG") {}

    function _baseURI() internal pure override returns (string memory) {
        return "https://raw.githubusercontent.com/jamesbachini/Gas-Paying-NFT/main/json/";
    }

    function mint(address _to) public payable {
        require(msg.value == 1 ether, "Send funds with TX");
        require(id < supply, "Sold out");
        stETH.submit{value: msg.value}(address(this));
        deposits += msg.value;
        id ++;
        _safeMint(_to, id);
    }

    function burn(uint _id) public {
        require(ownerOf(_id) == msg.sender, "Not owner");
        _burn(_id);
        deposits -= 1 ether;
        stETH.transfer(msg.sender, 1 ether);
    }

    function distribute() public {
        uint fundsAvailable = stETH.balanceOf(address(this)) - deposits;
        stETH.approve(address(curve), fundsAvailable);
        uint min = fundsAvailable * 995 / 1000;
        curve.exchange(1,0,fundsAvailable,min);
        uint fundsPerUser = address(this).balance / id;
        for (uint i = 1; i <= id; i++) {
            payable(ownerOf(i)).transfer(fundsPerUser);
        }
    }

    receive() external payable{}
    fallback() external payable{}
}