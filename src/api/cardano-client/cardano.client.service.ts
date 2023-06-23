import {
    BlockFrostAPI,
    BlockfrostServerError,
  } from '@blockfrost/blockfrost-js';
  
  import { composeTransaction } from './helpers/composeTransaction';
  import { signTransaction } from './helpers/signTransaction';
  import { deriveAddressPrvKey, mnemonicToPrivateKey } from './helpers/key';
  import { UTXO } from './types';
  import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from '@nestjs/mongoose';
import { AdminDocument, AdminEntity } from 'src/database/entities/admin.entity';
import { Model } from 'mongoose';
import { Role } from '../auth/enums/role.enum';

@Injectable()
export class CardanoClient{
    client = null;
    constructor(
      @InjectModel(AdminEntity.name) private readonly adminModel: Model<AdminDocument>
    ){
        this.client = new BlockFrostAPI({
            projectId: "preview0KIfmvhnPdllw9D4ZyzBILLtEZBKgbwJ",
            network: 'preview',
          });
    }


    async withdrawableBalance(){
      return {
        availableBalance: (await this.adminModel.findOne({role: Role.ADMIN}).lean()).profitBalance || 0
      }
    }


    async withDraw(OUTPUT_ADDRESS, OUTPUT_AMOUNT){
    
        let toDeduct = OUTPUT_AMOUNT;
    
        OUTPUT_AMOUNT = (OUTPUT_AMOUNT * 1e6).toString()
        
        const admin = await this.adminModel.findOne({role: Role.ADMIN});

        if(admin.profitBalance <= +toDeduct) throw new BadRequestException("Not enough profit earned.")

        const MNEMONIC ="shoulder file chair sun open empty luxury voyage atom decide level chimney unfold pen exist"

        const bip32PrvKey = mnemonicToPrivateKey(MNEMONIC);
        const testnet = true;
        const { signKey, address } = deriveAddressPrvKey(bip32PrvKey, testnet);
        console.log(`Using address ${address}`);
      
        // Retrieve utxo for the address
        let utxo: UTXO = [];
        try {
          utxo = await this.client.addressesUtxosAll(address);
        } catch (error) {
          if (error instanceof BlockfrostServerError && error.status_code === 404) {
            // Address derived from the seed was not used yet
            // In this case Blockfrost API will return 404
            utxo = [];
          } else {
            throw error;
          }
        }
      
        if (utxo.length === 0) {
          console.log();
          console.log(
            `You should send ADA to ${address} to have enough funds to sent a transaction`,
          );
          console.log();
        }
      
        console.log(`UTXO on ${address}:`);
        console.log(JSON.stringify(utxo, undefined, 4));
      
        // Get current blockchain slot from latest block
        const latestBlock = await this.client.blocksLatest();
        const currentSlot = latestBlock.slot;
        if (!currentSlot) {
          throw Error('Failed to fetch slot number');
        }
      
        // Prepare transaction
        const { txHash, txBody } = composeTransaction(
          address,
          OUTPUT_ADDRESS,
          OUTPUT_AMOUNT,
          utxo,
          currentSlot,
        );
      
        // Sign transaction
        const transaction = signTransaction(txBody, signKey);
      
        // Push transaction to network
        try {
          const res = await this.client.txSubmit(transaction.to_bytes());
          if (res) {
            console.log(`Transaction successfully submitted: ${txHash}`);
            admin.profitBalance = admin.profitBalance - +toDeduct;
            await admin.save()
            return {
                txHash
            }
          }
        } catch (error) {
          // submit could fail if the transactions is rejected by cardano node
          if (error instanceof BlockfrostServerError && error.status_code === 400) {
            console.log(`Transaction ${txHash} rejected`);
            // Reason for the rejection is in error.message
            console.log(error.message);
          } else {
            // rethrow other errors
            throw error;
          }
        }
    }

}