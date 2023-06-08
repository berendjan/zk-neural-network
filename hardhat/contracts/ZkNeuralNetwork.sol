// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import "../node_modules/@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "../node_modules/@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "./Verifier.sol";

contract ZkNeuralNetwork is VRFConsumerBaseV2 {
    enum WithdrawalState {
        Idle, // no withdrawal started
        RandomNumberRequested, // requestWithdrawal called
        ProvideZkProof // call
    }

    WithdrawalState private s_withdrawalState;
    uint private s_numberToVerify;
    uint private s_requestId;

    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    Verifier private immutable i_zkNeuralNetworkVerifier;
    bytes32 private immutable i_gaslane;
    uint64 private immutable i_subscriptionId;
    uint32 private immutable i_gasLimit;

    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint16 private constant NUM_RANDOM_WORDS = 1;

    constructor(
        address zkNeuralNetworkVerifier,
        address vrfCoordinatorV2,
        bytes32 gaslane,
        uint64 subscriptionId,
        uint32 gasLimit
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_zkNeuralNetworkVerifier = Verifier(zkNeuralNetworkVerifier);
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_gaslane = gaslane;
        i_subscriptionId = subscriptionId;
        i_gasLimit = gasLimit;
        s_withdrawalState = WithdrawalState.Idle;
    }

    receive() external payable {}

    function requestWithdrawal() external {
        require(
            s_withdrawalState == WithdrawalState.Idle,
            "must be in Idle state to start withdrawal"
        );
        s_requestId = i_vrfCoordinator.requestRandomWords(
            i_gaslane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_gasLimit,
            NUM_RANDOM_WORDS
        );
        s_withdrawalState = WithdrawalState.RandomNumberRequested;
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        require(
            s_withdrawalState == WithdrawalState.RandomNumberRequested,
            "must be in RandomNumberRequested state"
        );
        require(s_requestId == requestId, "requestId is not matching");
        s_numberToVerify = randomWords[0] % 10;
        s_withdrawalState = WithdrawalState.ProvideZkProof;
    }

    function withdrawWithProofOfZkNeuralNetwork(
        uint a1,
        uint a2,
        uint b11,
        uint b12,
        uint b21,
        uint b22,
        uint c1,
        uint c2,
        uint[1] memory input
    ) external {
        // verify that the public data part of the proof equals the number given by the vrf. aka we're checking the right number.
        require(input[0] == s_numberToVerify, "Providing proof for wrong number");

        Verifier.Proof memory proof = Verifier.Proof(
            Pairing.G1Point(a1, a2),
            Pairing.G2Point([b11, b12], [b21, b22]),
            Pairing.G1Point(c1, c2)
        );

        bool verified = i_zkNeuralNetworkVerifier.verifyTx(proof, input);
        require(verified, "The neural network did not classifiy the input as correct!");

        uint256 balance = address(this).balance;
        (bool sent, ) = msg.sender.call{value: balance}("");
        require(sent, "Failed to send Ether");

        s_withdrawalState = WithdrawalState.Idle;
    }

    function getRequestId() public view returns (uint) {
        return s_requestId;
    }

    function getSubscriptionId() public view returns (uint) {
        return i_subscriptionId;
    }

    function getNumberToVerify() public view returns (uint) {
        return s_numberToVerify;
    }
}
