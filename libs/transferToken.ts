import * as token from "@solana/spl-token"
import { web3 } from "@project-serum/anchor";


/**
 * Üretilen token'ı başka bir hesaba göndermek için kullanılır.
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
 * @param source \
 * Token'a sahip olan hesap , bu hewsaptan token çekilecek
 * 
 * ---
 * @param destination \
 * Token'ın gönderileceği hesap
 * 
 * ---
 * @param owner \
 * Token'ın sahibi
 * 
 * ---
 * @param amount \
 * Ne kadar token gönderileceği
 * 
 * ---
 * @param mint \
 * Token'ın mint accountu
 * 
 *  
*/

export async function transferToken(
    connection: web3.Connection,
    payer: web3.Keypair,
    source: web3.PublicKey,
    destination: web3.PublicKey,
    owner: web3.PublicKey,
    amount: number,
    mint: web3.PublicKey
) {
    const mintInfo = await token.getMint(connection, mint)

    const transactionSignature = await token.transfer(
        connection,
        payer,
        source,
        destination,
        owner,
        amount * 10 ** mintInfo.decimals
    )

    console.log(
        `Transfer Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
    )
}
