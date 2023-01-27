import * as token from "@solana/spl-token"
import {web3} from "@project-serum/anchor";


/**
 * Bu fonksiyon verilen user için , associated token account oluşturur.
 * Her token için her kullanıcıya bir token account oluşturulur.
 * Oluşturlan token account PDA tarafından üretilir.
 * 
 * 
 * **Notlar** 
 * 
 * Unutulmaması gereken bir nokta, ödeyen ve sahibin farklı olabileceğidir - birinin hesabını oluşturmak için ödeme yapabilirsiniz. \
 * Hesapları için "kira" ödeyeceğiniz için bu pahalı olabilir, bu yüzden bunu matematik yapmadan yapmadığınızdan emin olun.
 * @see {@link https://app.patika.dev/courses/introduction-to-solana-part-2/Mint-tokens-on-Solana | Mint tokens on Solana}
 * 
 * 
 * @example
 * Burada bu seedler otomatik tanımlanarak PDA hesabı oluşturulur.
 * Smart Conract yazılırken yada Test oluşturulurken buna dikkat edilmelidir.
 * > **Bu token accountu , başka bir PDA accountundan türetilmesine izin verilmiştir.**
 * ```
 *  seeds = [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()]
 * ```
 * ---
 * @param connection \
 * Solana bağlantısı
 * 
 * ---
 * @param payer \
 * Token account oluşturulma ücretini ödeyecek hesap
 * 
 * ---
 * @param mint \
 * Token'ın mint accountu
 * 
 * ---
 * @param owner \
 * Associated token account'un sahibi
 * 
 * @returns 
 * -  ``tokenAccount`` \
 * Oluşturulan token account
 * @example 
 * ```ts
 * {
 *  mint : web3.PublicKey,
 *  owner : web3.PublicKey,
 *  amount : float,
 *  delegate : ?,
 *  state : ?,
 *  isNative : ?,
 * }
 * ```
 * 
 */
export async function createTokenAccount(
    connection: web3.Connection,
    payer: web3.Keypair,
    mint: web3.PublicKey,
    owner: web3.PublicKey
) {
    const tokenAccount = await token.getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        mint,
        owner,
        true
    )
    
    console.log(
        `Token Account: https://explorer.solana.com/address/${tokenAccount.address}?cluster=devnet`
    )

    return tokenAccount
}