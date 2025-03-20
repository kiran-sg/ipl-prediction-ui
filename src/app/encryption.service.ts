import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {

  private secretKey = 'mySecretKey12345'; // Use a secure key (16, 24, or 32 bytes for AES)

  encrypt(data: string): string {
    // Use AES encryption with CBC mode and PKCS7 padding
    const encrypted = CryptoJS.AES.encrypt(data, this.secretKey, {
      mode: CryptoJS.mode.CBC, // Cipher Block Chaining mode
      padding: CryptoJS.pad.Pkcs7, // PKCS7 padding
    });
    return encrypted.toString(); // Returns a Base64-encoded string
  }
}
