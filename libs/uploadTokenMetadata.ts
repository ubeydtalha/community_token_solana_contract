
import {
    Metaplex,
    keypairIdentity,
    bundlrStorage,
    toMetaplexFile,
    findMetadataPda,
} from "@metaplex-foundation/js"
import {
    DataV2,
    createCreateMetadataAccountV2Instruction,
    createUpdateMetadataAccountV2Instruction,

} from "@metaplex-foundation/mpl-token-metadata"
import * as fs from "fs"
import path from 'path';
import { web3 } from "@project-serum/anchor";
import path from 'path';
import { Transaction } from '@solana/web3.js';

/**
     * Token Metadata'sına verilen değerleri yükler
     * 
     * @param metaplex \
     * Metaplex objesi : It should be created with the `Metaplex.make` method.
     * 
     * @example
     *   const metaplex = Metaplex.make(connection)
     *      .use(keypairIdentity(user))
     *      .use(
     *      bundlrStorage({
     *          address: "https://devnet.bundlr.network",
     *          providerUrl: "https://api.devnet.solana.com",
     *          timeout: 60000,
     *      })
     *      )
     *
     * ---
     * @param mint \
     * Token'ın mint adresi
     * ---
     * @param user \
     * Token'ın sahibi ve update authority'si
     * ---
     * @param payer \
     * Token'ın mint parasını ödeyecek hesap
     * ---
     * @param name \
     * Token'ın adı
     * ---
     * @param symbol \
     * Token'ın simgesi
     * ---
     * @param description \
     * Token'ın açıklaması
     * ---
     * @param creators 
     *  \
     * Token'ın yaratıcısı
     * 
     * @example
     * const creators = [
     *     {
     *          address: user.publicKey,
     *          verified: true,
     *          share: 100,
     *    },
     * ]
     * 
     */
export async function uploadTokenMetadata(
    connection,
    metaplex: Metaplex,
    mint: web3.PublicKey,
    user: web3.Keypair,
    payer: web3.Keypair,
    name: string,
    symbol: string,
    description: string,
    creators: Array,
) {
    try {


        // parametreleri logla
        console.log(
            `Mint : ${mint}`,
            `User : ${user.secretKey}`,
            `Payer : ${payer.secretKey}`,
            `Name : ${name}`,
            `Symbol : ${symbol}`,
            `Description : ${description}`,
            `Creators : ${creators}`,
            `metaplex : ${metaplex}`
        );


        // let buffer = fs.readFileSync("assets/lama.png");
        // let file = toMetaplexFile(buffer, "lama.png")

        // let imageUri = await metaplex.storage().upload(file)
        // console.log("image uri:", imageUri)
        let uri;
        try {


            uri = await metaplex
                .nfts()
                .uploadMetadata({
                    name: name,
                    description: description,
                    image: "https://arweave.net/W3NsAXsXEdHy0Jtnsz4DHUqcLo7uSW7jMLfykGi0jgc?ext=png",
                }).then((res) => { return res.uri })

            console.log("metadata uri:", uri)
        } catch (error) {
            console.log("metaplex",error);
            return;

        }
        let metadataPDA;

        try {


            metadataPDA = metaplex.nfts().pdas().metadata({ mint: mint })
            console.log("metadata PDA:", metadataPDA)
        } catch (error) {
            console.log("PDA",error);
            return;
        }
        let tokenMetadata = {
            name: name,
            symbol: symbol,
            uri: uri,
            sellerFeeBasisPoints: 750,
            creators: null,
            collection: null,
            uses: null,
        } as DataV2
        // } catch (error) {
        //     console.log(error);
        // }
        // try {

        let transaction;

        // transaction to create metadata account
        try {


            transaction = new web3.Transaction().add(
                createCreateMetadataAccountV2Instruction(
                    { // accounts 
                        metadata: new web3.PublicKey(metadataPDA),
                        mint: mint,
                        mintAuthority: user.publicKey,
                        payer: payer.publicKey,
                        updateAuthority: user.publicKey,
                    },
                    { // args
                        createMetadataAccountArgsV2: {
                            data: tokenMetadata,
                            isMutable: true, //A boolean indicating if the Metadata Account can be updated. Once flipped to False, it cannot ever be True again.


                        },
                    },

                )
            )
        } catch (error) {
            console.log("Transaction",error);
            return;
        }
        // send transaction
        // const transactionSignature = await web3.sen(
        //     connection,
        //     transaction,
        //     [payer]
        // )

        let transactionSignature;

        try {


            
            transactionSignature = await connection.sendTransaction(
                transaction,
                [user],
            )
        } catch (error) {
            console.log("Send",error);
            return;
        }

        console.log(
            `Create Metadata Account: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
        )
    } catch (error) {

        console.log(error);
    }
}




export async function createTokenMetadata(
    connection: web3.Connection,
    metaplex: Metaplex,
    mint: web3.PublicKey,
    user: web3.Keypair,
    name: string,
    symbol: string,
    description: string,

) {

    // file to buffer

    const buffer = fs.readFileSync("assets/lama.png")

    // buffer to metaplex file
    const file = toMetaplexFile(buffer, "lama.png")

    // upload image and get image uri
    const imageUri = await metaplex.storage().upload(file)
    console.log("Image URI:", imageUri);


    // upload metadata and get metadata uri (off chain metadata)
    const { uri } = await metaplex.nfts().uploadMetadata({
        name: name,
        description: description,
        image: imageUri,
    })

    // get metadata account address
    const metadataPDA = await metaplex.nfts().pdas().metadata({ mint: mint })

    // onchain metadata format
    const tokenMetadata = {
        name: name,
        symbol: symbol,
        uri: uri,
        sellerFeeBasisPoints: 0,
        creators: null,
        collection: null,
        uses: null,

    } as DataV2

    // transaction to create metadata account
    const transaction = new web3.Transaction().add(
        createCreateMetadataAccountV2Instruction(
            {
                metadata: metadataPDA,
                mint,
                mintAuthority: user.publicKey,
                payer: user.publicKey,
                updateAuthority: user.publicKey,
            },
            {
                createMetadataAccountArgsV2: {
                    data: tokenMetadata,
                    isMutable: true,
                }
            }
        )
    )

    // send transaction
    const transactionSignature = await connection.send(
        transaction,
        [user],
    )

    console.log("Transaction signature:", transactionSignature);

    console.log(
        `Transaction: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`
    );

}
