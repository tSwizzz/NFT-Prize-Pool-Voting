/** @format */

import { ethers } from "ethers";

const prizePoolAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const prizePoolAbi = [
    "constructor()",
    "function allParticipants(uint256) view returns (address)",
    "function beginContest() view returns (bool)",
    "function beginContestValue() view returns (bool)",
    "function contestEnded() view returns (bool)",
    "function contestEndedValue() view returns (bool)",
    "function end()",
    "function onERC721Received(address operator, address from, uint256 tokenId, bytes data) returns (bytes4)",
    "function owner() view returns (address)",
    "function submitNFT(address nft, uint256 nftId) payable",
    "function vote() payable",
    "function withdrawAllFunds()",
    "function withdrawLockedEther()",
    "function withdrawNFT()",
    "function withdrawPrizePool()",
];

const provider = new ethers.providers.Web3Provider(window.ethereum);

export const connect = async () => {
    await provider.send("eth_requestAccounts", []);
    return getContract();
};

export const getContract = async () => {
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
        prizePoolAddress,
        prizePoolAbi,
        signer,
    );
    return { signer: signer, contract: contract };
};
