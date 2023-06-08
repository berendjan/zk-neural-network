export interface networkConfigItem {
    blockConfirmations?: number
    vrfCoordinatorAddress?: string
}

export interface networkConfigInfo {
    [key: string]: networkConfigItem
}

export const networkConfig: networkConfigInfo = {
    localhost: {},
    hardhat: {},
    sepolia: {
        vrfCoordinatorAddress: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
        blockConfirmations: 6,
    },
}

export const developmentChains = ["hardhat", "localhost"]
