import { network, ethers, deployments } from "hardhat"
import { assert } from "chai"
import fs from "fs"
import { developmentChains } from "../helper-hardhat-config"

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Unit Test", function () {
          it("test withdraw", async () => {
              let { get } = deployments
              await deployments.fixture(["mocks", "zk-neural-network"])
              let accounts = await ethers.getSigners()
              let deployer = accounts[0]
              const vrfCoordinatorDeployment = await get("VRFCoordinatorV2Mock")
              const vrfCoordinator = await ethers.getContractAt(
                  "VRFCoordinatorV2Mock",
                  vrfCoordinatorDeployment.address
              )

              const zkNeuralNetworkDeployment = await get("ZkNeuralNetwork")
              const zkNeuralNetwork = await ethers.getContractAt(
                  "ZkNeuralNetwork",
                  zkNeuralNetworkDeployment.address
              )

              let subId = await zkNeuralNetwork.getSubscriptionId()
              let resp = await vrfCoordinator.addConsumer(subId, zkNeuralNetwork.address)
              await resp.wait()
              let isAdded = await vrfCoordinator.consumerIsAdded(subId, zkNeuralNetwork.address)
              assert(isAdded, "Adding contract as consumer failed")

              console.log(`got ZkNeuralNetwork contract at ${zkNeuralNetwork.address}`)
              let deposit = ethers.utils.parseEther("0.1")
              let receipt = await deployer.sendTransaction({
                  to: zkNeuralNetwork.address,
                  value: deposit,
                  gasLimit: 10000000,
              })
              receipt.wait()
              let newbalance = await ethers.provider.getBalance(zkNeuralNetwork.address)
              assert(newbalance.eq(deposit))
              console.log(`deposited ${ethers.utils.formatEther(newbalance)} ETH`)

              /// REQUEST WITHDRAWAL
              await zkNeuralNetwork.requestWithdrawal()
              let requestId = await zkNeuralNetwork.getRequestId()

              /// GET RANDOMNESS
              await vrfCoordinator.fulfillRandomWords(requestId, zkNeuralNetwork.address)
              let randomNumberToVerify = await zkNeuralNetwork.getNumberToVerify()
              console.log(
                  `Need to verify number ${randomNumberToVerify} by making a proof that passes the zkNN`
              ) // 1

              /// WITHDRAW WITH ZK PROOF OF NEURAL NETWORK FORWARD PASS
              const proof = JSON.parse(fs.readFileSync("../zokrates/proof.json", "utf-8"))
              await zkNeuralNetwork.withdrawWithProofOfZkNeuralNetwork(
                  proof.proof.a[0],
                  proof.proof.a[1],
                  proof.proof.b[0][0],
                  proof.proof.b[0][1],
                  proof.proof.b[1][0],
                  proof.proof.b[1][1],
                  proof.proof.c[0],
                  proof.proof.c[1],
                  proof.inputs
              )

              /// ASSERT BALANCE IS 0
              let newnewbalance = await ethers.provider.getBalance(zkNeuralNetwork.address)
              assert(newnewbalance.eq(0))
              console.log(`Withdrawed ${ethers.utils.formatEther(newbalance)} ETH`)
              console.log(`New contract balance ${ethers.utils.formatEther(newnewbalance)} ETH`)
          })
      })
