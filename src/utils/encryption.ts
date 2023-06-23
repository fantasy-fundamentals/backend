import { Injectable } from '@nestjs/common';
import { createCipheriv, scrypt, createDecipheriv } from 'crypto';
import { promisify } from 'util';

@Injectable()
export class Encryption {
  constructor() {}

  async testEncryption(value: string) {
    const encryptedText = await this.decryptStrings(value);
    console.log(
      encryptedText,
    );
  }

  async encryptStrings(textToEncrypt: string) {
    const iv = process.env.ENCRYTPION_IV;
    const key = await this.generateKey();

    const cipher = createCipheriv('aes-256-ctr', key, iv);
    const encryptedText = Buffer.concat([
      cipher.update(textToEncrypt),
      cipher.final(),
    ]);

    return encryptedText.toString('hex');
  }

  async decryptStrings(encryptedText: string) {
    let bufferencryptedText = Buffer.from(encryptedText, 'hex');
    const iv = process.env.ENCRYTPION_IV;
    const key = await this.generateKey();
    const decipher = createDecipheriv('aes-256-ctr', key, iv);
    const decryptedText = Buffer.concat([
      decipher.update(bufferencryptedText),
      decipher.final(),
    ]);

    return decryptedText.toString();
  }

  async generateKey() {
    const password = process.env.ENCRYTPTION_KEY;
    return (await promisify(scrypt)(password, 'salt', 32)) as Buffer;
  }
}
