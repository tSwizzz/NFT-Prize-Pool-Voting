/** @format */

const provider = new ethers.providers.Web3Provider(window.ethereum);
let signer;

const nftAbi = [
    "constructor(string tokenName, string symbol)",
    "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
    "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)",
    "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
    "function approve(address to, uint256 tokenId)",
    "function balanceOf(address owner) view returns (uint256)",
    "function baseURI() view returns (string)",
    "function getApproved(uint256 tokenId) view returns (address)",
    "function isApprovedForAll(address owner, address operator) view returns (bool)",
    "function mintToken(address owner, string metadataURI) returns (uint256)",
    "function name() view returns (string)",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function safeTransferFrom(address from, address to, uint256 tokenId)",
    "function safeTransferFrom(address from, address to, uint256 tokenId, bytes _data)",
    "function setApprovalForAll(address operator, bool approved)",
    "function supportsInterface(bytes4 interfaceId) view returns (bool)",
    "function symbol() view returns (string)",
    "function tokenByIndex(uint256 index) view returns (uint256)",
    "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
    "function tokenURI(uint256 tokenId) view returns (string)",
    "function totalSupply() view returns (uint256)",
    "function transferFrom(address from, address to, uint256 tokenId)",
];
const nftAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
let nftContract = null;

const prizePoolAbi = [
    "constructor()",
    "function beginContest() view returns (bool)",
    "function end()",
    "function onERC721Received(address operator, address from, uint256 tokenId, bytes data) returns (bytes4)",
    "function submitNFT(address nft, uint256 nftId) payable",
    "function vote() payable",
    "function withdrawLockedEther()",
    "function withdrawPrizePool()",
];
const prizePoolAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
let prizePoolContract = null;

async function getAccess() {
    if (nftContract) return;
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    nftContract = new ethers.Contract(nftAddress, nftAbi, signer);
    prizePoolContract = new ethers.Contract(
        prizePoolAddress,
        prizePoolAbi,
        signer,
    );
}

let spotsRemaining = 5; //when this reaches 0, we can begin the contest
async function submit() {
    await getAccess();
    const id = document.getElementById("token-id").value;
    const amount = document.getElementById("buy-in-amount").value;

    await prizePoolContract
        .submitNFT(nftAddress, id, { value: amount })
        .then(() => {
            alert("did this work lol");
        })
        .catch((error) => {
            if (error.data) alert(error.data.message);
            else alert(error);
        });

    if ((await nftContract.balanceOf(prizePoolAddress)) == 1) {
        //begins contest
    }
}

async function approveNFT() {
    await getAccess();
    const id = document.getElementById("token-id-approve").value;

    await nftContract
        .approve(prizePoolAddress, id)
        .then(() => alert("success"))
        .catch((error) => {
            if (error.data) alert(error.data.message);
            else alert(error);
        });
}

async function displayNFTs() {
    await getAccess();

    //grab all NFTs inside the smart contract
    const numNFTs = await nftContract.balanceOf(prizePoolAddress);

    //loop through each NFT and display the image on screen
    for (let k = 0; k < numNFTs; k++) {
        return nftContract.tokenByIndex(k).then((nftId) => {
            nftContract
                .tokenURI(nftId)
                .then((uri) => getUrl(uri))
                .then((link) => fetch(link))
                .then((data) => data.json())
                .then((json) => {
                    const test = document.getElementById("test");
                    const img = document.createElement("img");
                    img.src = getUrl(json.image);
                    img.width = 200;
                    test.appendChild(img);
                });
        });
    }
}

function getUrl(ipfs) {
    return "http://localhost:8080/ipfs" + ipfs.split(":")[1].slice(1);
}
