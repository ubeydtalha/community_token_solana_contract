import * as token from "@solana/spl-token"
import { web3 } from "@project-serum/anchor";

/**
* Mint accountu oluşturulmuş tokenı basmak(üretmek) için kullanılır. \
* Basılan token `destination` hesabına gönderilir. Daha doğrusu onun için basılır:)
*
*   
* ---
* @param connection \
* Solana bağlantısı
*
* ---
* @param payer \
* Token basma işlemini ödeyecek hesap 
*
* ---
* @param mint \
* Token'ın mint accountu
*
* ---
* @param destination \
* Token'ın basılacağı hesap
*
* ---
* @param authority \
* Token'ın mint accountunu yöneten hesap
* Aynı zamanda bu işlemi imzalayan hesap
*
* ---
* @param amount \
* Ne kadar token basılacağı
* TODO : Daha fazla açıklama eklenecek
* 
*/
export async function mintToken(
    connection: web3.Connection,
    payer: web3.Keypair,
    mint: web3.PublicKey,
    destination: web3.PublicKey,
    authority: web3.Keypair,
    amount: number
) {
    const mintInfo = await token.getMint(connection, mint)

    const transactionSignature = await token.mintTo(
        connection,
        payer,
        mint,
        destination,
        authority,
        amount * 10 ** mintInfo.decimals
    )

    console.log(
        `Mint Token Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
    )
}