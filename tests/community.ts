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
  var mint ;//= new anchor.web3.PublicKey("2UiH979Y8D76PhsXJihnL7AEZtvhaf2zwi9nqNRSXykV");
  let user = provider.wallet.payer;
  let murat = new anchor.web3.PublicKey("LPXpLwQ3mZNdxqDCqNWdoXRTbqMLkEhjEBWAq32aepY")
  // seed is 32 bytes  Uint8Array from derived "community"
  const community_wallet_keypair = anchor.web3.Keypair.generate();
  let custom_member_token_account;
  // .fromSecretKey(
  //   new Uint8Array([
  //     54, 218, 16, 158, 195, 144, 245, 39, 55, 157, 193,
  //     70, 218, 163, 200, 168, 223, 90, 198, 53, 225, 194,
  //     21, 111, 21, 77, 68, 69, 11, 186, 86, 194, 248,
  //     196, 58, 57, 48, 160, 124, 74, 98, 65, 225, 141,
  //     231, 77, 216, 166, 0, 218, 232, 177, 107, 220, 210,
  //     251, 24, 183, 1, 39, 224, 157, 65, 18
  //   ])
  // );
  // console.log("community_wallet_keypair", community_wallet_keypair.secretKey);

  let community_wallet = new anchor.Wallet(community_wallet_keypair);
  // .fromSeed(
  //   anchor.utils.bytes.utf8.encode("community").slice(0, 32)
  // );




  const community = anchor.web3.PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode('community'),
      anchor.utils.bytes.utf8.encode('new_community'),
      new anchor.BN(2).toArrayLike(Buffer, "le", 8),
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

  const owner_state = anchor.web3.PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode('user_state'),
      provider.wallet.publicKey.toBuffer(),
    ],
    program.programId
  )[0]




  const custom_member = anchor.web3.Keypair.generate();
  // .fromSecretKey(
  //   new Uint8Array([
  //     180, 228, 5, 132, 87, 26, 238, 86, 166, 210, 179,
  //     55, 217, 218, 159, 40, 126, 234, 107, 101, 66, 213,
  //     14, 182, 8, 216, 140, 162, 134, 205, 255, 228, 247,
  //     61, 57, 103, 49, 152, 151, 253, 52, 11, 103, 252,
  //     103, 144, 92, 213, 173, 11, 137, 36, 47, 227, 254,
  //     213, 109, 54, 201, 75, 202, 158, 79, 1
  //   ])
  // );
  //.fromSeed([anchor.utils.bytes.utf8.encode('custom_member')].slice(0, 32));
  // console.log("custom_member", custom_member.secretKey);

  const custom_member_public_key = anchor.web3.PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode('community_member'),
      community.toBuffer(),
      custom_member.publicKey.toBuffer(),
    ],
    program.programId
  )[0];

  const custom_member_state = anchor.web3.PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode('user_state'),
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

  const community_product_PDA = anchor.web3.PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode('community_product'),
      community.toBuffer(),
      new anchor.BN(2).toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  )[0]

  it ("create owner state"  , async () => {
 
    try {
      
    
      const txx = await program.methods.createUserState().accounts(
        {
          owner: provider.wallet.publicKey,
          userState: owner_state,
          systemProgram: anchor.web3.SystemProgram.programId,
        }
      )
      .rpc();
      } catch (error) {
        if (!error.message.includes("UserStateAlreadyInitialized")) {
          console.log("owner",error);
        }
        }
  })
  
  it ("custom member state"  , async () => {

    try {
      let custom_member_balance = await connection.getBalance(custom_member.publicKey);

      let i = custom_member_balance;
    while (i < 6 * anchor.web3.LAMPORTS_PER_SOL) {
      let airdrop = connection.requestAirdrop(custom_member.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL)
        .then((res) => {
          console.log("Airdrop successful");
        }).catch((err) => {
          console.log("Airdrop failed");
        });      i += 2 * anchor.web3.LAMPORTS_PER_SOL;
        // 1 saniye bekle
        await new Promise(r => setTimeout(r, 10000));
      }
    
      const txx = await program.methods.createUserState().accounts(
        {
          owner: custom_member.publicKey,
          userState: custom_member_state,
          systemProgram: anchor.web3.SystemProgram.programId,
        }
      ).signers([custom_member])
      .rpc();
      } catch (error) {
        if (!error.message.includes("UserStateAlreadyInitialized")) {
          console.log("custom",error);
        }
          
        }
  })


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

    // Bir Community olu??turuyoruz.

    const tx = await program.methods.
      createCommunity(
        "new_community",
        new anchor.BN(2),
        community_wallet.publicKey,
        "https://arweave.net/e_s6UUVQXtfyy91R0joZxhc7Di7xzxOHGSPLGpgwu_Q",
        "Lama Guild",
      ).accounts(
        {
          communityAccount: community,
          userState: owner_state,
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

    // ??nce kullan??c??n??n state'ini olu??turuyoruz.
    // Olusturulan community'ye moderator ekliyoruz.
    // Bu fonksiyon public key'i verilen kullan??c?? i??in community account olu??turur (PDA)

    // Ayn?? kullan??c??ya daha ??nce state olu??turdu??umdan bu ad??m?? atlad??m

    // const txx = await program.methods.createUserState().accounts(
    //   {
    //     owner: provider.wallet.publicKey,
    //     userState: owner_state,
    //     systemProgram: anchor.web3.SystemProgram.programId,
    //   }
    // )
    // .rpc();

    try {
      
    const tx = await program.methods.
      addModerator(
        provider.wallet.publicKey,
      ).accounts(
        {
          communityAccount: community,
          communityMember: community_member_account_owner,
          userState: owner_state,
          owner: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        }
      ).rpc();
    console.log("Your transaction signature", tx);
    
    } catch (error) {
      if (!error.message.includes("UserAlreadyModerator.")) {
        console.log("add mod",error);
      }
    }
  });


  //    88888888b       dP oo   dP      8888ba.88ba                      dP                         
  //    88              88      88      88  `8b  `8b                     88                         
  //   a88aaaa    .d888b88 dP d8888P    88   88   88 .d8888b. 88d8b.d8b. 88d888b. .d8888b. 88d888b. 
  //    88        88'  `88 88   88      88   88   88 88ooood8 88'`88'`88 88'  `88 88ooood8 88'  `88 
  //    88        88.  .88 88   88      88   88   88 88.  ... 88  88  88 88.  .88 88.  ... 88       
  //    88888888P `88888P8 dP   dP      dP   dP   dP `88888P' dP  dP  dP 88Y8888' `88888P' dP       






  it("Edit member data.", async () => {

    // Community member'??n bilgilerini degistiriyoruz.
    // Community'ye eklenmi?? bir kullan??c??n??n community accountunu editliyoruz

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

    try {
          
    //new anchor.web3.Connection(anchor.web3.clusterApiUrl("devnet"));
    // ??nce community c??zdan??nda yeterli miktarda SOL olup olmad??????n?? kontrol ediyoruz.
    // yoksa ekliyoruz (airdrop) , Devnet i??in ge??erli bu durum
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



    let payer = community_wallet.payer;
    // Token??m??z??n mint hesab??n?? olu??turuyoruz
    if (!mint ){
      mint = await createNewMint(
        connection,
        payer,
        community_wallet.publicKey,
        community_wallet.publicKey,
        8,
      );
    }

    // Community c??zdan??na token hesab?? olu??turuyoruz
    const tokenAccount = await createTokenAccount(
      connection,
      community_wallet.payer,
      mint,
      community_wallet_keypair.publicKey,
    );

    // Community accountuna mint ve token adreslerini ekliyoruz
    const tx = await program.methods.addToken(
      mint,
      tokenAccount.address).accounts(
        {
          communityAccount: community,
          communityOwner: provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        }
      ).rpc();
      
    console.log("Your transaction signature", tx);

        } catch (error) {
            if (!error.message.includes("CommunityTokenAlreadyExists")) {
              console.log("create token and token account to community",error);
            }
        }
  });


  // dP     dP          dP                         dP    d888888P          dP                            888888ba             dP            
  // 88     88          88                         88       88             88                            88    `8b            88            
  // 88     88 88d888b. 88 .d8888b. .d8888b. .d888b88       88    .d8888b. 88  .dP  .d8888b. 88d888b.    88     88 .d8888b. d8888P .d8888b. 
  // 88     88 88'  `88 88 88'  `88 88'  `88 88'  `88       88    88'  `88 88888"   88ooood8 88'  `88    88     88 88'  `88   88   88'  `88 
  // Y8.   .8P 88.  .88 88 88.  .88 88.  .88 88.  .88       88    88.  .88 88  `8b. 88.  ... 88    88    88    .8P 88.  .88   88   88.  .88 
  // `Y88888P' 88Y888P' dP `88888P' `88888P8 `88888P8       dP    `88888P' dP   `YP `88888P' dP    dP    8888888P  `88888P8   dP   `88888P8 
  //           88                                                                                                                           
  //           dP                                                                                                                           
  

  it("Upload token metadata.", async () => {

    let name = "Test Token";
    let description = "Test Token Description";

    // let mint = new anchor.web3.PublicKey("2UiH979Y8D76PhsXJihnL7AEZtvhaf2zwi9nqNRSXykV");

    // Token??m??z??n metadatalar??n?? y??kl??yoruz
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



  // a88888b.                              dP               d888888P          dP                             .d888888                                                 dP   
  // d8'   `88                              88                  88             88                            d8'    88                                                 88   
  // 88        88d888b. .d8888b. .d8888b. d8888P .d8888b.       88    .d8888b. 88  .dP  .d8888b. 88d888b.    88aaaaa88a .d8888b. .d8888b. .d8888b. dP    dP 88d888b. d8888P 
  // 88        88'  `88 88ooood8 88'  `88   88   88ooood8       88    88'  `88 88888"   88ooood8 88'  `88    88     88  88'  `"" 88'  `"" 88'  `88 88    88 88'  `88   88   
  // Y8.   .88 88       88.  ... 88.  .88   88   88.  ...       88    88.  .88 88  `8b. 88.  ... 88    88    88     88  88.  ... 88.  ... 88.  .88 88.  .88 88    88   88   
  //  Y88888P' dP       `88888P' `88888P8   dP   `88888P'       dP    `88888P' dP   `YP `88888P' dP    dP    88     88  `88888P' `88888P' `88888P' `88888P' dP    dP   dP   
 

  it("Create token account for user.", async () => {

    // let mint = new anchor.web3.PublicKey("2UiH979Y8D76PhsXJihnL7AEZtvhaf2zwi9nqNRSXykV");
    // Tokena sahip olacak kullan??c??n??n Associated Token Account'unu olu??turuyoruz.
    // bu i??lem t??m ??yeler i??in yap??lmal??d??r
    custom_member_token_account = await createTokenAccount(
      connection,
      community_wallet.payer,
      mint,
      custom_member.publicKey,
    ).then((res) => {
      return res;
    
    }).catch((err) => {
      console.log("create token account for user",err);
    }
    );

      
      
  });


  // 8888ba.88ba  oo            dP      d888888P          dP                         
  // 88  `8b  `8b               88         88             88                         
  // 88   88   88 dP 88d888b. d8888P       88    .d8888b. 88  .dP  .d8888b. 88d888b. 
  // 88   88   88 88 88'  `88   88         88    88'  `88 88888"   88ooood8 88'  `88 
  // 88   88   88 88 88    88   88         88    88.  .88 88  `8b. 88.  ... 88    88 
  // dP   dP   dP dP dP    dP   dP         dP    `88888P' dP   `YP `88888P' dP    dP 

  

  it("Mint token.", async () => {
    // token??m??z?? mint ediyoruz ve istedi??imiz kullan??c??ya veriyoruz
    let tx = await mintToken(
      connection,
      community_wallet.payer,
      mint,
      custom_member_token_account.address,
      community_wallet.payer,
      52 
    )

    console.log("Mint token tx: ", tx);
    
  });


  // a88888b.                              dP                888888ba                          dP                     dP   
  // d8'   `88                              88                88    `8b                         88                     88   
  // 88        88d888b. .d8888b. .d8888b. d8888P .d8888b.    a88aaaa8P' 88d888b. .d8888b. .d888b88 dP    dP .d8888b. d8888P 
  // 88        88'  `88 88ooood8 88'  `88   88   88ooood8     88        88'  `88 88'  `88 88'  `88 88    88 88'  `""   88   
  // Y8.   .88 88       88.  ... 88.  .88   88   88.  ...     88        88       88.  .88 88.  .88 88.  .88 88.  ...   88   
  //  Y88888P' dP       `88888P' `88888P8   dP   `88888P'     dP        dP       `88888P' `88888P8 `88888P' `88888P'   dP   
                                                                                                                      

  it("Create community product", async () => {

    let tx = await program.methods.createCommunityProduct(
      new anchor.BN(2),
      "1 Community Token",
      "1 Community Token Description",
      "https://www.arweave.net/1",
      1.0,
      0.001,
      0.002,
    ).accounts(
      {
        communityAccount: community,
        owner: community_wallet_keypair.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        sender : provider.wallet.publicKey,
        product:community_product_PDA
      }
      
    )
    .signers([community_wallet_keypair])
    .rpc();

    console.log("Create community product tx: ", tx);
    

  });




});


