import * as Crypto from 'crypto';

export function generateRandomSecret(length = 256) {
  return Crypto.randomBytes(length).toString('hex');
}

export const generateRandomString = (length: number): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let resultStr = ' ';

  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    resultStr += characters.charAt(
      Math.floor(Math.random() * charactersLength),
    );
  }

  return resultStr;
};
