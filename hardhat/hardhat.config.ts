import { HardhatUserConfig } from "hardhat/config"
import "@nomicfoundation/hardhat-toolbox"
import "hardhat-deploy"
import "hardhat-contract-sizer"
import "dotenv/config"

const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "key"
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "key"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "key"

const TEST_DEPLOYER_PRIVATE_KEY = process.env.TEST_DEPLOYER_PRIVATE_KEY || "0xkey0"
const TEST_MAKER_PRIVATE_KEY = process.env.TEST_MAKER_PRIVATE_KEY || "0xkey1"
const TEST_TAKER_PRIVATE_KEY = process.env.TEST_TAKER_PRIVATE_KEY || "0xkey2"

const config: HardhatUserConfig = {
    defaultNetwork: "hardhat",
    solidity: "0.8.18",
    networks: {
        hardhat: {
            chainId: 31337,
        },
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [TEST_DEPLOYER_PRIVATE_KEY, TEST_MAKER_PRIVATE_KEY, TEST_TAKER_PRIVATE_KEY],
            chainId: 11155111,
        },
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    gasReporter: {
        enabled: true,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
        // coinmarketcap: COINMARKETCAP_API_KEY,
    },
    contractSizer: {
        only: ["Amsterdex"],
    },
    namedAccounts: {
        deployer: {
            default: 0, // here this will by default take the first account as deployer
            // 1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
            11155111: 0,
        },
        maker: {
            default: 1,
            11155111: 1,
        },
        taker: {
            default: 2,
            11155111: 2,
        },
    },
    mocha: {
        timeout: 10000,
    },
}

export default config
