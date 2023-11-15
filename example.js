import HDWalletProvider from '@truffle/hdwallet-provider'
import Web3 from 'web3'
import tokenDistributor from './build/tokenDistributor.json' assert {type: 'json'};
import dotenv from 'dotenv'

dotenv.config();
const { MNEMONIC, PROJECT_ID } = process.env;
const contractAddress = '0x7206F6164A02d50cFFFDAc0a1BFAE55f00Aa7D82';

const sepoliaProvider = new HDWalletProvider(MNEMONIC,`https://sepolia.infura.io/v3/${INFURA_KEY}`);
const web3Sepolia = new Web3(sepoliaProvider);
const accounts = await web3Sepolia.eth.getAccounts();
const owner = accounts[0];
const contract = new web3Sepolia.eth.Contract(tokenDistributor.abi, contractAddress);

let txData = await tokenDistributor.methods.equallyDistributeETHFromReserve(['']).encodeABI();
let gasEst = await tokenDistributor.methods.equallyDistributeETHFromReserve(['']).estimateGas({from: owner});
let tx = await tokenDistributor.methods.equallyDistributeETHFromReserve(['']).send({from: owner, data: txData, gas: gasEst});

sepoliaProvider.engine.stop();