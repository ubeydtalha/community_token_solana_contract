import * as token from "@solana/spl-token"
import { web3 } from "@project-serum/anchor";

/**
 * Token'ı yakmak için kullanılır.
 * 
 * 
 * @param connection \
 * Solana bağlantısı
 * 
 * ---
 * @param payer \
 * Token transferi için ödeyecek hesap
 * 
 * ---
 * @param account \
 * Token'a sahip olan hesap , bu hesaptan token çekilecek
 * 
 * ---
 * @param mint \
 * Token'ın mint accountu
 * 
 * ---
 * @param owner \
 * Token'ın sahibi
 * 
 * ---
 * @param amount \
 * Ne kadar token gönderileceği
 * 
*/
export async function burnToken (
    connection: web3.Connection,
    payer: web3.Keypair,
    account: web3.PublicKey,
    mint: web3.PublicKey,
    owner: web3.Keypair,
    amount: number
) {
    const transactionSignature = await token.burn(
        connection,
        payer,
        account,
        mint,
        owner,
        amount
    )

    console.log(
        `Burn Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
    )
}