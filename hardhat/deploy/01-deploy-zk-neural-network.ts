import { DeployFunction } from "hardhat-deploy/dist/types"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { networkConfig, developmentChains } from "../helper-hardhat-config"

const VRF_SUB_FUND_AMOUNT = "1000000000000000000000"

const deployZkNeuralNetwork: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { getNamedAccounts, deployments, network, ethers } = hre
    const { deploy, log, get } = deployments
    const { deployer, player } = await getNamedAccounts()

    let vrfCoordinatorAddress: string
    let subscriptionId: number
    let me: string
    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorDeployment = await get("VRFCoordinatorV2Mock")
        const vrfCoordinator = await ethers.getContractAt(
            "VRFCoordinatorV2Mock",
            vrfCoordinatorDeployment.address
        )
        vrfCoordinatorAddress = vrfCoordinator.address
        const transactionResponse = await vrfCoordinator.createSubscription()
        log(`response ${transactionResponse}`)
        const receipt = await transactionResponse.wait()

        receipt.events?.forEach((event) => log(`event ${event.event}`))

        const event = receipt.events?.find((event) => event.event === "SubscriptionCreated")

        log(`subId ${event!.args!.subId}`)

        subscriptionId = event!.args!.subId

        let resp = await vrfCoordinator.fundSubscription(subscriptionId, VRF_SUB_FUND_AMOUNT)
        let rect = await resp.wait()
    } else {
        vrfCoordinatorAddress = networkConfig[network.name].vrfCoordinatorAddress!
        subscriptionId = 1672
        me = deployer
    }

    log("Deploying Verfier")
    const verfier = await deploy("Verifier", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
    })

    log(`address VRFCoordinatorV2Mock ${vrfCoordinatorAddress}`)
    log("----------------------------------")
    log(`subId ${subscriptionId}  deployer ${deployer}`)
    let args = [
        verfier.address,
        vrfCoordinatorAddress,
        "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
        subscriptionId,
        10_000_000,
    ]

    log("Deploying ZkNeuralNetwork...")
    log(deployer)
    const zkNeuralNetwork = await deploy("ZkNeuralNetwork", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
    })
    log(`ZkNeuralNetwork deployed at ${zkNeuralNetwork.address}`)
}

export default deployZkNeuralNetwork
deployZkNeuralNetwork.tags = ["all", "zk-neural-network"]
