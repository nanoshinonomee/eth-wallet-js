var Web3 = require('web3');
var prompt = require('prompt');
var fs = require('fs');
var web3instance = new Web3();

prompt.start();
initPrompt();


// TODO: interface is likely needed maybe use appjs, electron, or nsw.js
// TODO: allow a way to make multiple addresses inside one wallet, instead of just 1 using accounts.wallet.create(number);


function initPrompt() {

    var initPromptSchema = {
        properties: {
            option: {
                message: 'Create Wallet or Decrypt Existing Wallet?',
                required: true
            }
        }
    };

    prompt.get(initPromptSchema, function (err, result) {
        var choice = result.option.toLowerCase();

        if (choice.includes("create") && choice.includes("decrypt")) {
            console.log('Please type either Create or Decrypt, not both');
            initPrompt();
        }
        else if (choice.includes("create")) {
            console.log('Create Wallet Chosen');
            CreateWallet();
        }
        else if (choice.includes("decrypt")) {
            console.log('Decrypt Wallet Chosen');
            DecryptWallet();
        }
        else {
            console.log('Please type either Create or Decrypt.');
            initPrompt();
        }

        // Log the results here if you want
        // console.log('Command-line input received:');
    });
}






function CreateWallet() {
    var ethWallet = web3instance.eth.accounts.create();

    // console.log("ethWallet", ethWallet);   // dont show this, shows private key

    var promptSchema = {
        properties: {
            password: {
                message: 'Type a password to encrypt your wallet\'s private key',
                required: true
            }
        }
    };

    prompt.start();
    prompt.get(promptSchema, function (err, result) {
        EncryptEthWallet(ethWallet, result.password);
        // Log the results here if you want
        // console.log('Command-line input received:');
    });
}






function EncryptEthWallet(ethWallet, userPass) {
    var encryptedWalletResults = web3instance.eth.accounts.encrypt(ethWallet.privateKey, userPass);
    //console.log("encryptedWalletResults", encryptedWalletResults);

    var jsonData = JSON.stringify(encryptedWalletResults);

    // lets save the file to the wallets folder
    fs.writeFile("./wallets/walletDataEncrypted.json", jsonData, function (error) {
        if (error) { console.log(error); }
    });

    console.log("Your wallet has been created. You can find its information in the wallets folder. It has been encrypted using your password.");
}


function DecryptWallet() {

    let rawData = fs.readFileSync('./wallets/walletDataEncrypted.json');
    let encryptedWalletData = JSON.parse(rawData);
    console.log("encryptedWalletData", encryptedWalletData);

    DecryptPasswordPrompt(encryptedWalletData);

}

function DecryptPasswordPrompt(encryptedWalletData) {

    var promptSchema = {
        properties: {
            password: {
                message: 'Type the password used when creating your wallet to decrypt your wallet\'s private key',
                required: true
            }
        }
    };

    prompt.start();
    prompt.get(promptSchema, function (err, result) {

        try {
            decryptedWalletData = web3instance.eth.accounts.decrypt(encryptedWalletData, result.password);
            console.log("Decrypted Wallet Data", decryptedWalletData);
        }
        catch (error) {
            console.log(error.message);
            if(error.message.includes("wrong password")){
                console.log("Wrong Password, try again");
                DecryptPasswordPrompt(encryptedWalletData);
            }
        }

    });
}

