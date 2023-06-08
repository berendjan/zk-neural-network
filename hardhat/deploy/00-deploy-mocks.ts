import { ethers } from "hardhat"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { networkConfig, developmentChains } from "../helper-hardhat-config"

const BASE_FEE = ethers.utils.parseEther("0.25")
const GAS_PRICE_LINK = "1000000000"

const deployMocks: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { getNamedAccounts, deployments, network } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    if (developmentChains.includes(network.name)) {
        log("Local network detected! Deploying mocks...")

        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            args: [BASE_FEE, GAS_PRICE_LINK],
            log: true,
            waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
        })
        log("Mocks Deployed!")
        log("----------------------------------")
        log("You are deploying to a local network, you'll need a local network running to interact")
        log("Please run `yarn hardhat console` to interact with the deployed smart contracts!")
        log("----------------------------------")
    }
}
export default deployMocks
deployMocks.tags = ["all", "mocks"]
