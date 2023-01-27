use anchor_lang::prelude::*;
#[cfg(not(feature = "development"))]
declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");
#[cfg(feature = "development")]
declare_id!("H5gdZMXhmQNxcWy7Y5YR4qw9Vhp2Dua9BdaVq2sHSfFE");

#[program]
pub mod community {
    use super::*;
/*####################################################################################################*/
/*####################################################################################################*/

    // ######## ##     ## ##    ##  ######  ######## ####  #######  ##    ##  ######  
    // ##       ##     ## ###   ## ##    ##    ##     ##  ##     ## ###   ## ##    ## 
    // ##       ##     ## ####  ## ##          ##     ##  ##     ## ####  ## ##       
    // ######   ##     ## ## ## ## ##          ##     ##  ##     ## ## ## ##  ######  
    // ##       ##     ## ##  #### ##          ##     ##  ##     ## ##  ####       ## 
    // ##       ##     ## ##   ### ##    ##    ##     ##  ##     ## ##   ### ##    ## 
    // ##        #######  ##    ##  ######     ##    ####  #######  ##    ##  ######  

/*####################################################################################################*/
/*####################################################################################################*/

// #####                                                   
// #     #  ####  #    # #    # #    # #    # # ##### #   # 
// #       #    # ##  ## ##  ## #    # ##   # #   #    # #  
// #       #    # # ## # # ## # #    # # #  # #   #     #   
// #       #    # #    # #    # #    # #  # # #   #     #   
// #     # #    # #    # #    # #    # #   ## #   #     #   
//  #####   ####  #    # #    #  ####  #    # #   #     #                                                            

    pub fn create_community(ctx: Context<CreateCommunity>, name: String, id: u64) -> Result<()> {
        let community = &mut ctx.accounts.community_account;
        community.name = name;
        community.id = id;
        community.owner = *ctx.accounts.community_owner.key;
        community.is_initialized = true;
        
        // community.key = community.to_account_info().key();
        msg!("Community created");
        Ok(())
    }

    pub fn add_moderator(ctx: Context<AddOrRemoveModerator>,user : Pubkey) -> Result<()> {
        require!(ctx.accounts.community_account.is_initialized,ErrorCodes::CommunityNotInitialized);
        // msg!("sender : {} , owner : {} ",ctx.accounts.owner.key(),ctx.accounts.community.owner);
        // require_keys_eq!(ctx.accounts.community_account.owner,ctx.accounts.owner.key(),ErrorCodes::UnAuthorized);
        require!(ctx.accounts.community_account.is_owner(&ctx.accounts.owner.key()),ErrorCodes::UnAuthorized);
        require!(!ctx.accounts.community_account.is_moderator_limit_reached(),ErrorCodes::UserLimitReached);
        // check if user is already a moderator
        require!(!ctx.accounts.community_account.is_moderator(&user.key()),ErrorCodes::UserAlreadyModerator);
        // let community_member = &mut ctx.accounts.community_member;
        // community_member.moderated_communities.push(ctx.accounts.community_account.key());
        let community = &mut ctx.accounts.community_account;
        community.moderators.push(user.key());
        msg!("Moderator added to community");
        Ok(())
    }

    pub fn add_user(ctx: Context<AddOrRemoveUser>,user : Pubkey) -> Result<()> {
        require!(ctx.accounts.community_account.is_initialized,ErrorCodes::CommunityNotInitialized);
        require!(ctx.accounts.community_account.is_owner(&ctx.accounts.owner.key()),ErrorCodes::UnAuthorized);
        require!(ctx.accounts.community_account.moderators.len()<100,ErrorCodes::UserLimitReached);
        // check if user is already a moderator
        require!(!ctx.accounts.community_account.is_user(&user.key()),ErrorCodes::UserAlreadyMember);
        // let community_member = &mut ctx.accounts.community_member;
        // community_member.member_communities.push(ctx.accounts.community_account.key());
        let community = &mut ctx.accounts.community_account;
        community.users.push(user.key());
        msg!("User added to community");
        Ok(())
    }

    pub fn remove_moderator(ctx: Context<AddOrRemoveModerator>,user : Pubkey) -> Result<()> {
        require!(ctx.accounts.community_account.is_initialized,ErrorCodes::CommunityNotInitialized);
        require!(ctx.accounts.community_account.is_owner(&ctx.accounts.owner.key()),ErrorCodes::UnAuthorized);
        // check user is not in the list
        require!(!ctx.accounts.community_account.is_moderator(&user.key()),ErrorCodes::UserNotModerator);
        
        // let community_member = &mut ctx.accounts.community_member;
        // community_member.moderated_communities.retain(|&x| x != ctx.accounts.community_account.key());
        let community = &mut ctx.accounts.community_account;
        community.moderators.retain(|&x| x != user.key());
        msg!("Moderator removed from community");



        Ok(())
    }

    pub fn remove_user(ctx: Context<AddOrRemoveUser>,user : Pubkey) -> Result<()> {
        require!(ctx.accounts.community_account.is_initialized,ErrorCodes::CommunityNotInitialized);
        require_keys_eq!(ctx.accounts.community_account.owner,ctx.accounts.owner.key(),ErrorCodes::UnAuthorized);
        // check user is not in the list
        require!(!ctx.accounts.community_account.is_user(&user.key()),ErrorCodes::UserNotMember);

        // let community_member = &mut ctx.accounts.community_member;
        // community_member.member_communities.retain(|&x| x != ctx.accounts.community_account.key());
        let community = &mut ctx.accounts.community_account;
        community.users.retain(|&x| x != user.key());
        msg!("User removed from community");
        Ok(())
    }

    pub fn delete_community(ctx: Context<CreateCommunity>) -> Result<()> {
        require_keys_eq!(ctx.accounts.community_account.owner,ctx.accounts.community_owner.key(),ErrorCodes::UnAuthorized);
        let community = &mut ctx.accounts.community_account;
        community.is_initialized = false;
        msg!("Community deleted");
        Ok(())
    }

    pub fn create_community_product(
        ctx: Context<CreateProduct>,
        id : u64,
        title: String,
        description: String,
        image_url: String,
        value: f64,
        price : f64,
        old_price : f64,
    ) -> Result<()> {
        require!(ctx.accounts.community_account.is_initialized,ErrorCodes::CommunityNotInitialized);
        require!(ctx.accounts.community_account.is_moderator(ctx.accounts.owner.key),ErrorCodes::UnAuthorized);
        require!(ctx.accounts.community_account.is_product_limit_reached(),ErrorCodes::CommunityProductLimitReached);
        let product = &mut ctx.accounts.product;
        require!(ctx.accounts.community_account.has_product(&product.key()),ErrorCodes::CommunityProductAlreadyExists);

        
        product.id = id;
        product.title = title;
        product.description = description;
        product.image_url = image_url;
        product.value = value;
        product.price = price;
        product.old_price = old_price;

        let community = &mut ctx.accounts.community_account;
        community.products.push(product.key());
        msg!("Community product created");
        Ok(())
    }

    pub fn edit_community_product(
        ctx: Context<CreateProduct>,
        id : u64,
        title: String,
        description: String,
        image_url: String,
        value: f64,
        price : f64,
        old_price : f64,
    ) -> Result<()> {
        require!(ctx.accounts.community_account.is_initialized,ErrorCodes::CommunityNotInitialized);
        require!(ctx.accounts.community_account.is_moderator(ctx.accounts.owner.key),ErrorCodes::UnAuthorized);
        let product = &mut ctx.accounts.product;
        product.id = id;
        product.title = title;
        product.description = description;
        product.image_url = image_url;
        product.value = value;
        product.price = price;
        product.old_price = old_price;
        msg!("Community product edited");
        Ok(())
    }

    pub fn delete_community_product(ctx: Context<DeleteProduct>) -> Result<()> {
        require!(ctx.accounts.community_account.is_initialized,ErrorCodes::CommunityNotInitialized);
        require!(ctx.accounts.community_account.is_moderator(ctx.accounts.owner.key),ErrorCodes::UnAuthorized);
        let product = &mut ctx.accounts.product;
        product.is_initialized = false;
        let community = &mut ctx.accounts.community_account;
        community.products.retain(|&x| x != product.key());
        msg!("Community product deleted");
        Ok(())
    }
    

// #     #                                           
// ##   ## ###### #    # #####  ###### #####   ####  
// # # # # #      ##  ## #    # #      #    # #      
// #  #  # #####  # ## # #####  #####  #    #  ####  
// #     # #      #    # #    # #      #####       # 
// #     # #      #    # #    # #      #   #  #    # 
// #     # ###### #    # #####  ###### #    #  ####  




    // This function for change user name and profile picture url
    pub fn edit_community_member_data(
        ctx: Context<EditMemberData>,
        name : String , 
        profile_picture_url : String,
        user : Pubkey
    ) -> Result<()> {
        require_keys_eq!(
            ctx.accounts.community_account.owner,user,
            ErrorCodes::UnAuthorized
        );

        let community_member_account = &mut ctx.accounts.community_member;
        community_member_account.name = name;
        community_member_account.profile_picture_url = profile_picture_url;

        Ok(())
    } 


    //  #######                                    
    //     #     ####  #    # ###### #    #  ####  
    //     #    #    # #   #  #      ##   # #      
    //     #    #    # ####   #####  # #  #  ####  
    //     #    #    # #  #   #      #  # #      # 
    //     #    #    # #   #  #      #   ## #    # 
    //     #     ####  #    # ###### #    #  ####  


}

/*####################################################################################################*/
/*####################################################################################################*/
/// 
// ######   #######  ##    ## ######## ######## ##     ## ########  ######  
// ##    ## ##     ## ###   ##    ##    ##        ##   ##     ##    ##    ## 
// ##       ##     ## ####  ##    ##    ##         ## ##      ##    ##       
// ##       ##     ## ## ## ##    ##    ######      ###       ##     ######  
// ##       ##     ## ##  ####    ##    ##         ## ##      ##          ## 
// ##    ## ##     ## ##   ###    ##    ##        ##   ##     ##    ##    ## 
//  ######   #######  ##    ##    ##    ######## ##     ##    ##     ######  
//
/*####################################################################################################*/
/*####################################################################################################*/
// #####                                                   
// #     #  ####  #    # #    # #    # #    # # ##### #   # 
// #       #    # ##  ## ##  ## #    # ##   # #   #    # #  
// #       #    # # ## # # ## # #    # # #  # #   #     #   
// #       #    # #    # #    # #    # #  # # #   #     #   
// #     # #    # #    # #    # #    # #   ## #   #     #   
//  #####   ####  #    # #    #  ####  #    # #   #     #                                                           


#[derive(Accounts)]
#[instruction(name : String , id : u64)]
pub struct CreateCommunity<'info> {
    #[account(mut)]
    pub community_owner: Signer<'info>,

    #[account(
        init_if_needed,
        seeds = [
            "community".as_bytes(),
            name.as_bytes(),
            &id.to_le_bytes(),
            community_owner.key.as_ref()
            ],
        payer = community_owner,
        space = Community::LEN,
        bump,
    )]
    pub community_account: Account<'info, Community>,
    
    #[account(
        init_if_needed,
        seeds = [
            "community_member".as_bytes(),
            community_account.to_account_info().key.as_ref(),
            community_owner.key.as_ref()
            ],
        payer = community_owner,
        space = CommunityMember::LEN,
        bump,
    )]
    pub community_member: Account<'info, CommunityMember>,

    pub system_program: Program<'info, System>,
}




#[derive(Accounts)]
#[instruction(moderator : Pubkey)]
pub struct AddOrRemoveModerator<'info> {
    #[account(mut)]
    pub community_account: Account<'info, Community>,

    pub owner : Signer<'info>,
    
    #[account(
        init_if_needed,
        seeds = [
            "community_member".as_bytes(),
            community_account.to_account_info().key.as_ref(),
            moderator.as_ref()
            ],
        payer = community_account,
        space = CommunityMember::LEN,
        bump,
    )]
    pub community_member: Account<'info, CommunityMember>,

    pub system_program: Program<'info, System>,

}

#[derive(Accounts)]
#[instruction(user : Pubkey)]
pub struct AddOrRemoveUser<'info> {
    #[account(mut)]
    pub community_account: Account<'info, Community>,
    pub owner : Signer<'info>,

    #[account(
        init_if_needed,
        seeds = [
            "community_member".as_bytes(),
            community_account.to_account_info().key.as_ref(),
            user.as_ref()
            ],
        payer = community_account,
        space = CommunityMember::LEN,
        bump,
    )]
    pub community_member: Account<'info, CommunityMember>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(id : u64,title : String , description : String, image_url : String , value : f64, price : f64, old_price : f64 )]
pub struct CreateProduct<'info> {
    #[account(mut)]
    pub community_account: Account<'info, Community>,
    pub owner : Signer<'info>,

    #[account(
        init_if_needed,
        seeds = [
            "product".as_bytes(),
            community_account.to_account_info().key.as_ref(),
            &id.to_le_bytes(),
            ],
        payer = community_account,
        space = CommunityProduct::LEN,
        bump,
    )]
    pub product: Account<'info, CommunityProduct>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DeleteProduct<'info> {
    #[account(mut)]
    pub community_account: Account<'info, Community>,
    pub owner : Signer<'info>,

    #[account(mut)]
    pub product: Account<'info, CommunityProduct>,

    pub system_program: Program<'info, System>,
}


// #     #                                           
// ##   ## ###### #    # #####  ###### #####   ####  
// # # # # #      ##  ## #    # #      #    # #      
// #  #  # #####  # ## # #####  #####  #    #  ####  
// #     # #      #    # #    # #      #####       # 
// #     # #      #    # #    # #      #   #  #    # 
// #     # ###### #    # #####  ###### #    #  ####                                                   


#[derive(Accounts)]
#[instruction(name : String, profile_picture_url : String , member : Pubkey)]
pub struct EditMemberData<'info> {

    #[account(mut)]
    pub community_account: Account<'info, Community>,

    #[account(
        init_if_needed,
        seeds = [
            "community_member".as_bytes(),
            community_account.to_account_info().key.as_ref(),
            member.as_ref()
            ],
        payer = community_account,
        space = CommunityMember::LEN,
        bump,
    )]
    pub community_member: Account<'info, CommunityMember>,

    pub system_program: Program<'info, System>,
}


    //  #######                                    
    //     #     ####  #    # ###### #    #  ####  
    //     #    #    # #   #  #      ##   # #      
    //     #    #    # ####   #####  # #  #  ####  
    //     #    #    # #  #   #      #  # #      # 
    //     #    #    # #   #  #      #   ## #    # 
    //     #     ####  #    # ###### #    #  ####  



/*####################################################################################################*/
/*####################################################################################################*/
//
// ########     ###    ########    ###          ###     ######   ######   #######  ##     ## ##    ## ########  ######  
// ##     ##   ## ##      ##      ## ##        ## ##   ##    ## ##    ## ##     ## ##     ## ###   ##    ##    ##    ## 
// ##     ##  ##   ##     ##     ##   ##      ##   ##  ##       ##       ##     ## ##     ## ####  ##    ##    ##       
// ##     ## ##     ##    ##    ##     ##    ##     ## ##       ##       ##     ## ##     ## ## ## ##    ##     ######  
// ##     ## #########    ##    #########    ######### ##       ##       ##     ## ##     ## ##  ####    ##          ## 
// ##     ## ##     ##    ##    ##     ##    ##     ## ##    ## ##    ## ##     ## ##     ## ##   ###    ##    ##    ## 
// ########  ##     ##    ##    ##     ##    ##     ##  ######   ######   #######   #######  ##    ##    ##     ######  
//
/*####################################################################################################*/
/*####################################################################################################*/


// #####                                                   
// #     #  ####  #    # #    # #    # #    # # ##### #   # 
// #       #    # ##  ## ##  ## #    # ##   # #   #    # #  
// #       #    # # ## # # ## # #    # # #  # #   #     #   
// #       #    # #    # #    # #    # #  # # #   #     #   
// #     # #    # #    # #    # #    # #   ## #   #     #   
//  #####   ####  #    # #    #  ####  #    # #   #     #   


//  Komuniti oluşturmak için kullanılacak bilgiler
// TODO komuniti cüzdanının public idsi eklenecek
#[account]
pub struct Community {
    pub name: String,
    pub id: u64,
    pub owner: Pubkey,
    pub is_initialized: bool,
    pub token_mint: Pubkey,
    pub token_account: Pubkey, // Komunitiye ait token hesabı, havuz hesabı
    pub bump: u8,
    pub users: Vec<Pubkey>,
    pub moderators: Vec<Pubkey>,
    pub wallet: Pubkey,
    pub products: Vec<Pubkey>,
    pub is_public: bool,
    // pub key : Pubkey,
    // token recycle logic için enum eklenecek
    // force user to buy token and burn pool tokens
    // primary use pool tokens else buy token
}

impl Community {
    pub const LEN: usize = 8 + 8 + 32 + 1 + 32 + 32 + 1 + 32 * 100 + 32 * 10 + 32 + 32 * 20 + 1; // 100 char limit , total 1000 byte
}

impl Community {

    pub fn is_owner(&self, owner: &Pubkey) -> bool {
        self.owner == *owner
    }

    pub fn is_moderator(&self, moderator: &Pubkey) -> bool {
        self.moderators.contains(moderator)
    }

    pub fn is_user(&self, user: &Pubkey) -> bool {
        self.users.contains(user)
    }

    pub fn is_user_limit_reached(&self) -> bool {
        self.users.len() >= 100
    }

    pub fn is_moderator_limit_reached(&self) -> bool {
        self.moderators.len() >= 10
    }

    pub fn is_product_limit_reached(&self) -> bool {
        self.products.len() >= 20
    }

    pub fn has_product(&self, product: &Pubkey) -> bool {
        self.products.contains(product)
    }
}

#[account]
pub struct CommunityProduct {

    
    pub title: String,
    pub description: String,
    pub image_url: String,
    pub value: f64,
    pub price: f64,
    pub old_price: f64,
    pub id: u64,
    pub bump: u8,
    pub community: Pubkey,
    pub is_initialized: bool,

}

impl CommunityProduct {
    pub const LEN: usize = 32 * 100 + 32 * 100 + 32 * 100 + 8 + 8 + 8 + 8 + 1 + 32 + 1; // 100 char limit , total 1000 byte
}


// #     #                                           
// ##   ## ###### #    # #####  ###### #####   ####  
// # # # # #      ##  ## #    # #      #    # #      
// #  #  # #####  # ## # #####  #####  #    #  ####  
// #     # #      #    # #    # #      #####       # 
// #     # #      #    # #    # #      #   #  #    # 
// #     # ###### #    # #####  ###### #    #  ####  
#[account]
pub struct CommunityMember {
    pub name: String,
    pub id: u64,
    pub owner: Pubkey,
    pub is_initialized: bool,
    pub token_mint: Pubkey,
    pub token_account: Pubkey, 
    pub bump: u8,
    pub profile_picture_url: String,
    // pub moderated_communities: Vec<Pubkey>,
    // pub member_communities: Vec<Pubkey>,
}

impl CommunityMember {
    pub const LEN: usize = 8 + 8 + 32 + 1 + 32 + 32 + 1 + 250 ; // 10 community limit , total 1000 byte+ 32 * 10 + 32 * 10
}







#[error_code]
pub enum ErrorCodes {
    CommunityNotInitialized,
    UnAuthorized,
    UserLimitReached,
    UserAlreadyModerator,
    UserNotModerator,
    UserAlreadyMember,
    UserNotMember,
    CommunityProductLimitReached,
    CommunityProductAlreadyExists,
}