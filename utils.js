'use strict';
const constant = require('./constants')
const crypto = require('crypto');

const ENCRYPTION_KEY = constant.encKey;// Must be 256 bits (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16

function encrypt(text) {
 let iv = crypto.randomBytes(IV_LENGTH);
 let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
 let encrypted = cipher.update(text);
 encrypted = Buffer.concat([encrypted, cipher.final()]);
 return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
 let textParts = text.split(':');
 let iv = Buffer.from(textParts.shift(), 'hex');
 let encryptedText = Buffer.from(textParts.join(':'), 'hex');
 let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
 let decrypted = decipher.update(encryptedText);
 decrypted = Buffer.concat([decrypted, decipher.final()]);
 return decrypted.toString();
}

const parameterizedString = (...args) => {
    const str = args[0];
    const params = args.filter((arg, index) => index !== 0);
    if (!str) return "";
    return str.replace(/%s[0-9]+/g, matchedStr => {
      const variableIndex = matchedStr.replace("%s", "") - 1;
      return params[variableIndex];
    }
    )
};
module.exports = {
    encrypt,
    decrypt,
    parameterizedString
}

