import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Community } from "../target/types/community";
import { Token, TOKEN_PROGRAM_ID, MintLayout, AccountLayout } from "@solana/spl-token";
import { clusterApiUrl, Connection, Keypair, Transaction, SystemProgram } from "@solana/web3.js";

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

import { createNewMint } from "../libs/createMint";
import { createTokenMetadata , uploadTokenMetadata } from "../libs/uploadTokenMetadata";
import { createTokenAccount } from "../libs/createTokenAccount";
import { mintToken } from "../libs/mintToken";
import { burnToken } from "../libs/burnToken";
import { transferToken } from "../libs/transferToken";


describe("community", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.getProvider();
  const program = anchor.workspace.Community as Program<Community>;
  let connection = provider.connection; 
  let mint = new anchor.web3.PublicKey("2UiH979Y8D76PhsXJihnL7AEZtvhaf2zwi9nqNRSXykV");;
  let user = provider.wallet.payer;
  let murat = new anchor.web3.PublicKey("LPXpLwQ3mZNdxqDCqNWdoXRTbqMLkEhjEBWAq32aepY")
  // seed is 32 bytes  Uint8Array from derived "community"
  const community_wallet_keypair = anchor.web3.Keypair.fromSecretKey(
    new Uint8Array([
      54, 218, 16, 158, 195, 144, 245, 39, 55, 157, 193,
      70, 218, 163, 200, 168, 223, 90, 198, 53, 225, 194,
      21, 111, 21, 77, 68, 69, 11, 186, 86, 194, 248,
      196, 58, 57, 48, 160, 124, 74, 98, 65, 225, 141,
      231, 77, 216, 166, 0, 218, 232, 177, 107, 220, 210,
      251, 24, 183, 1, 39, 224, 157, 65, 18
    ])
  );
  // console.log("community_wallet_keypair", community_wallet_keypair.secretKey);

  let community_wallet = new anchor.Wallet(community_wallet_keypair);
  // .fromSeed(
  //   anchor.utils.bytes.utf8.encode("community").slice(0, 32)
  // );




  const community = anchor.web3.PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode('community'),
      anchor.utils.bytes.utf8.encode('hello'),
      new anchor.BN(123).toArrayLike(Buffer, "le", 8),
      provider.wallet.publicKey.toBuffer(),
    ],
    program.programId
  )[0]

  const community_member_account_owner = anchor.web3.PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode('community_member'),
      community.toBuffer(),
      provider.wallet.publicKey.toBuffer(),
    ],
    program.programId
  )[0]



  const custom_member = anchor.web3.Keypair.fromSecretKey(
    new Uint8Array([
      180, 228, 5, 132, 87, 26, 238, 86, 166, 210, 179,
      55, 217, 218, 159, 40, 126, 234, 107, 101, 66, 213,
      14, 182, 8, 216, 140, 162, 134, 205, 255, 228, 247,
      61, 57, 103, 49, 152, 151, 253, 52, 11, 103, 252,
      103, 144, 92, 213, 173, 11, 137, 36, 47, 227, 254,
      213, 109, 54, 201, 75, 202, 158, 79, 1
    ])
  );//.fromSeed([anchor.utils.bytes.utf8.encode('custom_member')].slice(0, 32));
  // console.log("custom_member", custom_member.secretKey);

  const custom_member_public_key = anchor.web3.PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode('community_member'),
      community.toBuffer(),
      custom_member.publicKey.toBuffer(),
    ],
    program.programId
  )[0];

  let metaplex = Metaplex.make(connection)
  .use(keypairIdentity(user))
  .use(
    bundlrStorage({
      address: "https://devnet.bundlr.network",
      providerUrl: "https://api.devnet.solana.com",
      timeout: 60000,
    })
  )


  //    dP          oo   dP       a88888b.                                                  oo   dP               
  //    88               88      d8'   `88                                                       88               
  //    88 88d888b. dP d8888P    88        .d8888b. 88d8b.d8b. 88d8b.d8b. dP    dP 88d888b. dP d8888P dP    dP    
  //    88 88'  `88 88   88      88        88'  `88 88'`88'`88 88'`88'`88 88    88 88'  `88 88   88   88    88    
  //    88 88    88 88   88      Y8.   .88 88.  .88 88  88  88 88  88  88 88.  .88 88    88 88   88   88.  .88    
  //    dP dP    dP dP   dP       Y88888P' `88888P' dP  dP  dP dP  dP  dP `88888P' dP    dP dP   dP   `8888P88    
  //                                                                                                       .88    
  //                                                                                                d8888P     



  it("Is initialized!", async () => {
    // Add your test here.


    // let token = SystemProgram.createAccount({

    // })

    const tx = await program.methods.
      createCommunity(
        "hello",
        new anchor.BN(123)
      ).accounts(
        {
          communityAccount: community,
          communityOwner: provider.wallet.publicKey,
          communityMember: community_member_account_owner,
          systemProgram: anchor.web3.SystemProgram.programId,
        }
      ).rpc();
    console.log("Your transaction signature", tx);
  });



  //    .d888888        dP       dP    8888ba.88ba                 dP 
  //    d8'    88        88       88    88  `8b  `8b                88 
  //    88aaaaa88a .d888b88 .d888b88    88   88   88 .d8888b. .d888b88 
  //    88     88  88'  `88 88'  `88    88   88   88 88'  `88 88'  `88 
  //    88     88  88.  .88 88.  .88    88   88   88 88.  .88 88.  .88 
  //    88     88  `88888P8 `88888P8    dP   dP   dP `88888P' `88888P8 


  it("add_moderator", async () => {

    const tx = await program.methods.
      addModerator(
        provider.wallet.publicKey,
      ).accounts(
        {
          communityAccount: community,
          communityMember: community_member_account_owner,
          owner: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        }
      ).rpc();
    console.log("Your transaction signature", tx);
  });


  //    88888888b       dP oo   dP      8888ba.88ba                      dP                         
  //    88              88      88      88  `8b  `8b                     88                         
  //   a88aaaa    .d888b88 dP d8888P    88   88   88 .d8888b. 88d8b.d8b. 88d888b. .d8888b. 88d888b. 
  //    88        88'  `88 88   88      88   88   88 88ooood8 88'`88'`88 88'  `88 88ooood8 88'  `88 
  //    88        88.  .88 88   88      88   88   88 88.  ... 88  88  88 88.  .88 88.  ... 88       
  //    88888888P `88888P8 dP   dP      dP   dP   dP `88888P' dP  dP  dP 88Y8888' `88888P' dP       






  it("Edit member data.", async () => {

    const tx = await program.methods.editCommunityMemberData(
      "Test_Name",
      "test.com/profile.png",
      provider.wallet.publicKey,
    ).accounts(
      {
        communityAccount: community,
        communityMember: community_member_account_owner,
        systemProgram: anchor.web3.SystemProgram.programId,
      }
    ).rpc();

    console.log("Your transaction signature", tx);


  });


  //    a88888b.                              dP               d888888P          dP                         
  //    d8'   `88                              88                  88             88                         
  //    88        88d888b. .d8888b. .d8888b. d8888P .d8888b.       88    .d8888b. 88  .dP  .d8888b. 88d888b. 
  //    88        88'  `88 88ooood8 88'  `88   88   88ooood8       88    88'  `88 88888"   88ooood8 88'  `88 
  //    Y8.   .88 88       88.  ... 88.  .88   88   88.  ...       88    88.  .88 88  `8b. 88.  ... 88    88 
  //     Y88888P' dP       `88888P' `88888P8   dP   `88888P'       dP    `88888P' dP   `YP `88888P' dP    dP 


  it("Create community token.", async () => {


    //new anchor.web3.Connection(anchor.web3.clusterApiUrl("devnet"));
    // Önce community cüzdanında yeterli miktarda SOL olup olmadığını kontrol ediyoruz.
    // yoksa ekliyoruz (airdrop)
    let community_account_balance = await connection.getBalance(community_wallet.publicKey);

    console.log("Community account balance: ", community_account_balance);

    let i = community_account_balance;
    while (i < 6 * anchor.web3.LAMPORTS_PER_SOL) {
      let airdrop = connection.requestAirdrop(community_wallet.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL)
        .then((res) => {
          console.log("Airdrop successful");
        }).catch((err) => {
          console.log("Airdrop failed");
        });
      i += 2 * anchor.web3.LAMPORTS_PER_SOL;
      // 1 saniye bekle
      await new Promise(r => setTimeout(r, 10000));
    }



    

    // Metaplex için gerekli olan birkaç şeyi tanımlıyoruz.
    // const metaplex = Metaplex.make(connection)
    //   .use(keypairIdentity(user))
    //   .use(
    //     bundlrStorage({
    //       address: "https://devnet.bundlr.network",
    //       providerUrl: "https://api.devnet.solana.com",
    //       timeout: 60000,
    //     })
    //   )

    let payer = community_wallet.payer;
    // Tokenımızın mint hesabını oluşturuyoruz
    if (!mint ){
      mint = await createNewMint(
        connection,
        payer,
        community_wallet.publicKey,
        community_wallet.publicKey,
        8,
      );
    }

    // // Tokenımızın metadatalarını yüklüyoruz
    // const metadata = await uploadTokenMetadata(
    //   metaplex = metaplex,
    //   name = name,
    //   description = description,
    //   mint = mint,
    //   user = community_wallet
    // );


    // // Tokena sahip olacak kullanıcının Associated Token Account'unu oluşturuyoruz.
    // const tokenAccount = await createTokenAccount(
    //   connection = connection,
    //   payer = user,
    //   mint = mint,
    //   owner = community,
    // );


  });

  it("Upload token metadata.", async () => {

    let name = "Test Token";
    let description = "Test Token Description";

    // let mint = new anchor.web3.PublicKey("2UiH979Y8D76PhsXJihnL7AEZtvhaf2zwi9nqNRSXykV");

    // Tokenımızın metadatalarını yüklüyoruz
    let payer = community_wallet.payer;
    const metadata = await uploadTokenMetadata(
      connection,
      metaplex,
      mint,
      community_wallet.payer,
      community_wallet.payer,
      name,
      "Test",
      description,
      [
        // {
        //   address:user.publicKey,
        //   verified:true,
        //   share:100
        // }
      ]

    );

  });

  it("Create token account for user.", async () => {

    // let mint = new anchor.web3.PublicKey("2UiH979Y8D76PhsXJihnL7AEZtvhaf2zwi9nqNRSXykV");
    // Tokena sahip olacak kullanıcının Associated Token Account'unu oluşturuyoruz.
    
    const tokenAccount = await createTokenAccount(
      connection,
      community_wallet.payer,
      mint,
      murat,
    );

      
      
  });

  it("Mint token.", async () => {
    let tx = await mintToken(
      connection,
      community_wallet.payer,
      mint,
      new anchor.web3.PublicKey("PV9fvaEMXkJkvvTMKmcV6Go3b1pBFk7VEEdUakT7Hfm"),
      community_wallet.payer,
      52 
    )

    console.log("Mint token tx: ", tx);
    
  });

});


