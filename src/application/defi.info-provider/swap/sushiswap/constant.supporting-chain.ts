import { ChainId } from "src/domain/chain-id.enum";

export const SUSHI_SUPPORTING_CHAINS = [
  // Layer 1 Mainnets
  {id: ChainId.EthereumMain, name: "Ethereum", testnet: false},
  {id: ChainId.BnBMain, name: "BNB Smart Chain", testnet: false},
  {id: ChainId.FantomMain, name: "Fantom", testnet: false},
  {id: ChainId.GnosisMain, name: "Gnosis", testnet: false},
  {id: ChainId.AvalancheMain, name: "Avalanche", testnet: false},
  {id: ChainId.CronosMain, name: "Cronos", testnet: false},
  {id: ChainId.CoreDaoMain, name: "Core DAO", testnet: false},
  {id: ChainId.RootstockMain, name: "Rootstock", testnet: false},
  {id: ChainId.HaqqMain, name: "HAQQ", testnet: false},
  {id: ChainId.ThunderCoreMain, name: "ThunderCore", testnet: false},
  {id: ChainId.BitTorrentMain, name: "BitTorrent Chain", testnet: false},
  
  // Ethereum Layer 2
  {id: ChainId.ArbitrumMain, name: "Arbitrum One", testnet: false},
  {id: ChainId.ArbitrumNovaMain, name: "Arbitrum Nova", testnet: false},
  {id: ChainId.OptimismMain, name: "Optimism", testnet: false},
  {id: ChainId.BaseMain, name: "Base", testnet: false},
  {id: ChainId.PolygonMain, name: "Polygon", testnet: false},
  {id: ChainId.LineaMain, name: "Linea", testnet: false},
  {id: ChainId.ScrollMain, name: "Scroll", testnet: false},
  {id: ChainId.BlastMain, name: "Blast", testnet: false},
  {id: ChainId.ZkSyncMain, name: "zkSync Era", testnet: false},
  {id: ChainId.MantleMain, name: "Mantle", testnet: false},
  {id: ChainId.ModeMain, name: "Mode", testnet: false},
  {id: ChainId.MantaPacificMain, name: "Manta Pacific", testnet: false},
  {id: ChainId.MetisMain, name: "Metis", testnet: false},
  {id: ChainId.TaikoMain, name: "Taiko", testnet: false},
  {id: ChainId.ZkLinkMain, name: "zkLink Nova", testnet: false},
  
  // Other Layer 2
  {id: ChainId.BobaMain, name: "Boba Network", testnet: false},
  {id: ChainId.SonicMain, name: "Sonic", testnet: false},
  {id: ChainId.KavaMain, name: "Kava", testnet: false},
  {id: ChainId.CeloMain, name: "Celo", testnet: false},
  {id: ChainId.FilecoinMain, name: "Filecoin", testnet: false},
  {id: ChainId.ZetaChainMain, name: "ZetaChain", testnet: false},
  
  // Emerging Chains
  {id: ChainId.UnichainMain, name: "Unichain", testnet: false},
  {id: ChainId.HemiMain, name: "Hemi", testnet: false},
  {id: ChainId.KatanaMain, name: "Katana", testnet: false},
  {id: ChainId.HyperEvmMain, name: "HyperEVM", testnet: false},
  {id: ChainId.BeraChainMain, name: "BeraChain", testnet: false},
  {id: ChainId.PlasmaMain, name: "Plasma", testnet: false},
  {id: ChainId.SkaleEuropaMain, name: "Skale Europa Hub", testnet: false},
  {id: ChainId.ApeChainMain, name: "ApeChain", testnet: false},
];
