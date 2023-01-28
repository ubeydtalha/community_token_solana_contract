# community_token_solana_contract
.
```

Community 
|
|--> Create [PDA:"community"+name+id+community_owner.pubkey]
|--> Delete 
|--> Add mod [ init -> Community Account to User]
|--> Add user [ init -> Community Account to User]
|--> Remove mod
|--> Remove user
|
|--> | Product
     | 
     |-> Create and Add product [PDA:"product"+community_account.pubkey+id]
     |-> Remove Product
     |-> Edit Product
     
User
|
|--> Create State Account [PDA:"user_state"+user.pubkey]
|--/ Create Community Account [PDA:"community_member"+community_account.pubkey+user.pubkey]
|--> Edit Community Account 
```
# Community Tokens


> TR
Bu projede kendi içinde ticaret yapan komünitelerin , ticaretlerinde kendi tokenlarını kullanarak güvenli para transferi yapmasını sağlayan bir sistem yapılmıştır.
Bir komüniti oluşturup , kendinize ait token üretebilirsiniz ve bu tokenı üyelerinize satabilmeniz için ürün oluşturabilirsiniz.

> EN
In this project, a system was created that enables the communities that trade within themselves to transfer money securely by using their own tokens in their trade.
You can create a community, generate your own token, and create a product so that you can sell this token to your members.


# Future
> TR
Ürettiğiniz tokenlar diğer uygulamalar tarafından API desteği ile kullanılarak ,güvenli ticaret ortamı kurmuş olacaksınız.

> En
By using the tokens you produce with API support by other applications, you will establish a secure trading environment.



# Kullanım kılavuzu - Guide

## User State Account

> TR
- Her şeyden önce programın sizin state'inizi tutabilmesi için `createUserState()` metodu ile kendinize yada kullanıcıya account oluşturmalısınız.
- Bu metod bir PDA ile state account'u üretir.
> EN
- First of all, you should create an account for yourself or the user with the `createUserState()` method so that the program can keep your state.
-  This method generates the state account with a PDA.

```ts
const  custom_member = anchor.web3.Keypair.generate();
const  custom_member_state = anchor.web3.PublicKey.findProgramAddressSync(
	[
		anchor.utils.bytes.utf8.encode('user_state'),
		custom_member.publicKey.toBuffer(),
	],
	program.programId
)[0];
let tx = await  program.methods.createUserState().accounts(
{
	owner:  custom_member.publicKey,
	userState:  custom_member_state,
	systemProgram:  anchor.web3.SystemProgram.programId,
}
).signers([custom_member])
.rpc();

console.log(tx);
```

```mermaid
flowchart  LR
A[Create User State] -. PDA .-> D{UserState}
subgraph  UserStateDataAccount
D  
B[Seeds: 'user_state' , userPublicKey]
end 
subgraph  Data
Q1[owner: Pubkey]
Q2[is_initialized: bool]
Q3[joined_communities: Vec<Pubkey>]
Q4[moderated_communities: Vec<Pubkey>]
Q5[owned_communities: Vec<Pubkey>]
Q6[bump: u8]
end
D -..- Q1
D -..- Q2
D -..- Q3
D -..- Q4
D -..- Q5
D -..- Q6

```
