# community_token_solana_contract

will be prettyfied...


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
