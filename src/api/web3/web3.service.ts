import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import Common from 'ethereumjs-common';
import { Transaction as EthereumTx } from 'ethereumjs-tx';
import Web3 from 'web3';
import { ValidateContractOwnershipDto } from '../coins-management/dto/coin-management.dto';
import assetPoolAbi from './abis/assetpool.abi';
import erc20Abi from './abis/erc20.abi';
import reservesAbi from './abis/reserves.abi';
import ratesAbi from './abis/rates.abi';

import { SendErc20Interface } from './interfaces/send-erc20.interface';
import { SendEthInterface } from './interfaces/send-eth.interface';

@Injectable()
export class Web3Service {
  constructor(
    @Inject('BscWeb3')
    private readonly bscWeb3: Web3,
    @Inject('EthWeb3')
    private readonly ethWeb3: Web3,
    private readonly config: ConfigService,
  ) {}

  async getTxConfirmations(blockNumber: number, blockchain: string) {
    if (blockchain === 'ethereum') {
      const currentBlock = await this.ethWeb3.eth.getBlockNumber();
      return currentBlock - blockNumber;
    } else if (blockchain === 'binance') {
      const currentBlock = await this.bscWeb3.eth.getBlockNumber();
      return currentBlock - blockNumber;
    } else {
      return 'web3 does not support this blockchain';
    }
  }

  async getBscBalance(walletAddress: string) {
    const balance = await this.bscWeb3.eth.getBalance(walletAddress);

    return String(balance);
  }

  async getEthBalance(walletAddress: string) {
    const balance = await this.ethWeb3.eth.getBalance(walletAddress);
    return String(balance);
  }

  async getERC20Balance(
    tokenABI,
    contractAddress: string,
    walletAddress: string,
  ) {
    const contract = new this.ethWeb3.eth.Contract(tokenABI, contractAddress);
    const balance = await contract.methods.balanceOf(walletAddress).call();
    return String(balance);
  }

  async getBEP20Balance(
    tokenABI,
    contractAddress: string,
    walletAddress: string,
  ) {
    const contract = new this.bscWeb3.eth.Contract(tokenABI, contractAddress);
    const balance = await contract.methods.balanceOf(walletAddress).call();
    return String(balance);
  }

  async sendEthTrx(trxDetail: SendEthInterface) {
    const nonce = await this.ethWeb3.eth.getTransactionCount(trxDetail.from);
    // let gasPriceInWei = await this.ethWeb3.eth.getGasPrice();
    // let gasPriceFiat = this.ethWeb3.utils.fromWei(gasPriceInWei);

    /* create tx payload */
    const trx = {
      to: trxDetail.to,
      value: this.ethWeb3.utils.toHex(
        this.ethWeb3.utils.toWei(trxDetail.value?.toString(), 'ether'),
      ),
      gas: 21000,
      gasPrice: 500000000000,
      nonce: nonce,
      chainId: this.config.get('ETH_CHAIN_ID'),
    };

    /* sign tx */
    const transaction = new EthereumTx(trx, {
      chain: this.config.get('ETH_CHAIN'),
    });
    transaction.sign(Buffer.from(trxDetail.privateKey, 'hex'));

    /* send tx */
    const serializedTransaction = transaction.serialize();

    const tx = await this.ethWeb3.eth.sendSignedTransaction(
      '0x' + serializedTransaction.toString('hex'),
    );
    return tx;
  }

  async sendbnbTrx(trxDetail: SendEthInterface) {
    try {
      const nonce = await this.bscWeb3.eth.getTransactionCount(trxDetail.from);
      const trx = {
        to: trxDetail.to,
        value: this.bscWeb3.utils.toHex(
          this.bscWeb3.utils.toWei(trxDetail.value?.toString(), 'ether'),
        ),
        gas: 21000,
        gasPrice: 20000000000,
        nonce: nonce,
        chainId: process.env.BSC_CHAIN_ID,
      };

      const common = Common.forCustomChain(
        process.env.NETWORK,
        {
          name: 'bnb',
          chainId: Number(this.bscWeb3.utils.toHex(process.env.BSC_CHAIN_ID)),
        },
        'petersburg',
      );
      const transaction = new EthereumTx(trx, { common });

      transaction.sign(Buffer.from(trxDetail.privateKey, 'hex'));

      const serializedTransaction = transaction.serialize();
      const tx = await this.bscWeb3.eth.sendSignedTransaction(
        '0x' + serializedTransaction.toString('hex'),
      );

      return tx;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async sendErc20Trx(trxDetail: SendErc20Interface) {
    try {
      const nonce = await this.ethWeb3.eth.getTransactionCount(trxDetail.from);

      const contract_instance = new this.ethWeb3.eth.Contract(
        erc20Abi,
        trxDetail.contractAddress,
      );

      const method = contract_instance.methods.transfer(
        trxDetail.to,
        this.ethWeb3.utils.toWei(trxDetail.value, 'ether'),
      );

      const encoded = method.encodeABI();
      let gasPriceInWei = await this.ethWeb3.eth.getGasPrice();
      const gasLimit = await method.estimateGas({
        from: trxDetail.from,
        to: trxDetail.contractAddress,
      });

      const trx = {
        from: trxDetail.from,
        to: trxDetail.contractAddress,
        data: encoded,

        gasLimit: Number(gasLimit),
        gasPrice: Number(gasPriceInWei),
        nonce: nonce,
      };

      const common = Common.forCustomChain(
        'mainnet',
        {
          name: 'bnb',
          chainId: Number(
            this.ethWeb3.utils.toHex(this.config.get('BSC_CHAIN_ID')),
          ),
        },
        'petersburg',
      );
      const transaction = new EthereumTx(trx, { common });

      transaction.sign(Buffer.from(trxDetail.privateKey, 'hex'));

      const serializedTransaction = transaction.serialize();
      const tx = await this.ethWeb3.eth.sendSignedTransaction(
        '0x' + serializedTransaction.toString('hex'),
      );
      return tx;
    } catch (err) {
      console.log('--error---', err);
      throw err;
    }
  }

  async sendBep20Trx(trxDetail: SendErc20Interface) {
    try {
      const nonce = await this.bscWeb3.eth.getTransactionCount(trxDetail.from);

      const contract_instance = new this.bscWeb3.eth.Contract(
        erc20Abi,
        trxDetail.contractAddress,
      );

      const method = contract_instance.methods.transfer(
        trxDetail.to,
        this.bscWeb3.utils.toWei(trxDetail.value, 'ether'),
      );

      const encoded = method.encodeABI();

      let gasPriceInWei = await this.bscWeb3.eth.getGasPrice();

      const gasLimit = await method.estimateGas({
        from: trxDetail.from,
        to: trxDetail.contractAddress,
      });

      const trx = {
        from: trxDetail.from,
        to: trxDetail.contractAddress,
        data: encoded,
        // value: this.bscWeb3.utils.toHex(
        //   this.bscWeb3.utils.toWei(trxDetail.value, 'ether'),
        // ),
        gasLimit: Number(gasLimit),
        gasPrice: Number(gasPriceInWei),
        nonce: nonce,
        // chainId: this.config.get('BSC_CHAIN_ID'),
      };

      const common = Common.forCustomChain(
        'mainnet',
        {
          name: 'bnb',
          chainId: Number(
            this.bscWeb3.utils.toHex(this.config.get('BSC_CHAIN_ID')),
          ),
        },
        'petersburg',
      );
      const transaction = new EthereumTx(trx, { common });

      transaction.sign(Buffer.from(trxDetail.privateKey, 'hex'));

      const serializedTransaction = transaction.serialize();
      const tx = await this.bscWeb3.eth.sendSignedTransaction(
        '0x' + serializedTransaction.toString('hex'),
      );
      return tx;
    } catch (err) {
      console.log('--error---', err);
      throw err;
    }
  }

  async convertFromWei(value: string) {
    return this.bscWeb3.utils.fromWei(value);
  }

  async getNFTRemainingSupply(index: number) {
    const contract = new this.bscWeb3.eth.Contract(
      assetPoolAbi,
      '0xA5fe18119067155f8ae8580e76036354eD04F1E2',
    );

    const ownerBalance = await contract.methods
      .balanceOf('0x76cd0dfef3cc86a1527fdbc540420bfeb8ff5de9', index)
      .call();

    return ownerBalance;
  }
  async getNFTTotalSupply(index: number) {
    const contract = new this.bscWeb3.eth.Contract(
      assetPoolAbi,
      '0xA5fe18119067155f8ae8580e76036354eD04F1E2',
    );
    const supply = await contract.methods.totalSupply(index).call();
    return supply;
  }
  async getUserNftBalance(address: string, index: number) {
    const contract = new this.bscWeb3.eth.Contract(
      assetPoolAbi,
      '0xA5fe18119067155f8ae8580e76036354eD04F1E2',
    );

    const ownerBalance = await contract.methods
      .balanceOf(address, index)
      .call();

    return ownerBalance;
  }

  async valdiateAddress(payload: ValidateContractOwnershipDto) {
    const { contractAddress, chain } = payload;

    try {
      let response: any;
      switch (chain) {
        case 'eth':
          response = await axios.get(
            `https://api.etherscan.io/api?module=contract&action=getcontractcreation&contractaddresses=${contractAddress}&apikey=${this.config.get(
              'ETH_EXPLORER_API_KEY',
            )}`,
          );
          break;

        case 'bsc':
          response = await axios.get(
            `https://api.etherscan.io/api?module=contract&action=tokeninfo&contractaddresses=${contractAddress}&apikey=${this.config.get(
              'BSC_EXPLORER_API_KEY',
            )}`,
          );
          break;
        default:
          break;
      }

      let res = response.data;

      if (response.message === 'No data found') {
        return {
          status: 405,
          validate: false,
          message: 'Contract ownership is invalid, wait for admin approval',
        };
      }

      if (
        res.result &&
        res.result[0]?.contractCreator?.toLowerCase() ===
          payload.address?.toLowerCase()
      ) {
        return {
          status: 201,
          validate: true,
          message: 'Contract ownership validated successfully',
        };
      }

      return {
        status: 405,
        validate: false,
        message: 'Contract ownership is invalid, wait for admin approval',
      };
    } catch (err) {
      console.log(err);

      throw new BadRequestException(err);
    }
  }

  async getReserves() {
    const reservesContract = new this.bscWeb3.eth.Contract(
      reservesAbi,
      '0x6934fB516ca0a18285be7609E6c36B929E5E9029',
    );
    const reserves = await reservesContract.methods.getReserves().call();
    return reserves;
  }

  async getTokenRate({ _reserve0, _reserve1 }) {
    const ratesContract = new this.bscWeb3.eth.Contract(
      ratesAbi,
      '0xd99d1c33f9fc3444f8101754abc46c52416550d1',
    );
    const rate = await ratesContract.methods
      .quote('1000000000000000000', _reserve0, _reserve1)
      .call();
    return rate / 1e18;
  }
}
