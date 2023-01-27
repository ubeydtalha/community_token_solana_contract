import * as token from "@solana/spl-token"
import {web3} from "@project-serum/anchor";


/**
* Üretilecek token'ın mint accountunu oluşturur
* Mint account , üretilecek tokenı basmayı sağlayan bir program accounttur.
* 
* @param connection \
* Solana bağlantısı
*
*---
* @param payer \
* Mint accountunu oluşturulma ücretini ödeyecek hesap
*
*---
* @param mintAuthority \
* Mint accountunu oluşturan hesap - Token'ın sahibi
*
*---
* @param freezeAuthority \
* Token'ın dondurulmasını sağlayan hesap
*
*---
* @param decimals \
* Token'ın kaç basamaklı olacağı
*
*---
*/

export async function  createNewMint   (
    connection: web3.Connection,
    payer: web3.Keypair,
    mintAuthority: web3.PublicKey,
    freezeAuthority: web3.PublicKey,
    decimals: number
): Promise<web3.PublicKey> {

    console.log(
        `Payer : ${payer}`,
        `Mint Authority : ${mintAuthority}`,
        `Freeze Authority : ${freezeAuthority}`,
        `Decimals : ${decimals}`
    );
    
    let tokenMint: web3.PublicKey;

    try {



        tokenMint = await token.createMint(
        connection,
        payer,
        mintAuthority,
        freezeAuthority,
        decimals
    );
    } catch (error) {
        console.log("Error: ", error);
        let new_connection = new web3.Connection("https://api.devnet.solana.com");
        tokenMint = await token.createMint(
            new_connection,
            payer,
            mintAuthority,
            freezeAuthority,
            decimals
        );
    }
    

    console.log(`The token mint account address is ${tokenMint}`)
    console.log(
        `Token Mint: https://explorer.solana.com/address/${tokenMint}?cluster=devnet`
    );

    return tokenMint;
}

