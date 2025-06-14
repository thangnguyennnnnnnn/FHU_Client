import * as CryptoJS from 'crypto-js';
//const KEY = 'nguyenhuynhthang'; // Secret key used for encryption and decryption
export class CrytoService {

    encrypt(plainText: string, KEY: string): string {
      const encrypted = CryptoJS.AES.encrypt(plainText, KEY).toString();
      return encrypted;
    }
    
    decrypt(encryptedText: string, KEY: string): string {
      const decrypted = CryptoJS.AES.decrypt(encryptedText, KEY).toString(CryptoJS.enc.Utf8);
      return decrypted;
    }
}