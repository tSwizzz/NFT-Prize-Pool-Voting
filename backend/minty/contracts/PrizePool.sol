pragma solidity ^0.7.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract PrizePool {
    address owner;
    address winner;
    address[] allParticipants;

    uint prizePool;
    uint endTime;

    bool public beginContest;
    bool public contestEnded;

    //if there is a tie, then all funds are withdrawable to participant
    //if not, then all funds in this mapping are sent to prizePool
    mapping(address => uint) potentialWithdrawBalance;

    constructor() {
        owner = msg.sender;
    }

    struct NFT {
        IERC721 nft;
        address owner;
        uint nftId;
        uint numOfVotes;
        bool submitted; //participants can only submit 1 NFT per contest
    }
    mapping(address => NFT) participants;

    mapping(address => bool) voters;
    mapping(address => uint) lockedEther; //voter must lock 3000 wei before allowed to vote; reduces rigging of votes.. right?

    modifier onlyOwner() {
        require(owner == msg.sender);
        _;
    }

    modifier canSubmit(address nft, uint nftId) {
        require(
            !beginContest,
            "Contest has already begun. Submissions are not allowed"
        );
        require(
            IERC721(nft).getApproved(nftId) == address(this),
            "This contract is not approved to access this NFT. Please approve first."
        );
        require(
            IERC721(nft).ownerOf(nftId) == msg.sender,
            "You must submit an NFT you own"
        );
        require(
            !participants[msg.sender].submitted,
            "You have already submitted an NFT for this contest"
        );
        require(
            msg.value == 1000 wei,
            "Please send exactly 1000 wei to be able to submit your NFT"
        );
        _;
    }

    modifier canVote() {
        require(
            !voters[msg.sender],
            "You have already voted for a participant's NFT"
        );
        require(
            msg.value == 3000 wei,
            "You must lock exactly 3000 wei to be able to vote"
        );
        require(
            !participants[msg.sender].submitted,
            "You can't vote for your own NFT"
        );
        _;
    }

    modifier canWithdrawNFT() {
        require(
            contestEnded,
            "Please wait until the voting period is over to withdraw your NFT"
        );
        require(participants[msg.sender].nftId != 0, "No NFT to withdraw");
        _;
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) public returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    function submitNFT(
        address nft,
        uint nftId
    ) external payable canSubmit(nft, nftId) {
        IERC721(nft).safeTransferFrom(msg.sender, address(this), nftId);

        //update data for NFT struct
        participants[msg.sender].owner = msg.sender;
        participants[msg.sender].nft = nft;
        participants[msg.sender].nftId = nftId;
        participants[msg.sender].submitted = true;

        //update balances and tracking of participants
        potentialWithdrawBalance[msg.sender] += msg.value;
        allParticipants.push(msg.sender);

        //make this equal to 3 to make testing easier
        if (allParticipants.length == 5) {
            beginContest = true;
            endTime = block.timestamp + 1 days;
            //createNFTContest();
        }
    }

    function vote() external payable canVote {
        voters[msg.sender] = true;
        lockedEther[msg.sender] += msg.value;
    }

    function withdrawLockedEther() external {
        require(lockedEther[msg.sender] > 0, "No funds to withdraw");

        uint balance = lockedEther[msg.sender];
        lockedEther[msg.sender] = 0;
        (bool sent, ) = payable(msg.sender).call{value: balance}("");
        require(sent, "Withdraw failed, try again please");
    }

    function withdrawPrizePool() external {
        require(msg.sender == winner, "You are not the winner");

        (bool sent, ) = payable(msg.sender).call{value: prizePool}("");
        require(sent, "Withdraw failed, try again please");
    }

    function withdrawNFT() external canWithdrawNFT {
        participants[msg.sender].nft.safeTransferFrom(
            address(this),
            msg.sender,
            participants[msg.sender].nftId
        );
    }

    //this basically only exists for the purpose of testing so I don't have to
    //wait for the contest to end every time it starts lol
    function end() external onlyOwner {
        //end contest and delete all participant and voter data. Full reset.
    }

    //??
    function createNFTContest() internal {}
}
