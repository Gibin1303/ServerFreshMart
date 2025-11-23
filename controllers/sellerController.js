import jwt from 'jsonwebtoken'





export const sellerLogin = async(req,res)=>{
    const{email,password}=req.body
    try{
        if(email=== process.env.SELLER_EMAIL && password === process.env.SELLER_PASSWORD){
            const token = jwt.sign({email},process.env.JWT_SECRET,{expiresIn:'7d'})

            res.cookie('sellerToken',token,{
                httpOnly:true,    
                secure:process.env.NODE_ENV === "production"?"production":false, 
                sameSite:process.env.NODE_ENV === "production" ? 'none' : 'strict', 
                maxAge:7 * 24 * 60 * 60 * 1000,
            })

            return res.json({success:true,message:"Logged In"})
        }else{
            return res.json({success:false,message:"Invalid Credientials"})

        }
    }catch(error){
        res.json({success:false,message:error.message})
    }
}


// check auth

export const  isSellerAuth = async(req,res)=>{
   try{
      return res.json({success:true})
   }catch(error){
      res.json({success:false,message:error.message})
      
   }
}


// seller Logout



export const sellerLogout = async(req,res)=>{
   try{
      res.clearCookie('sellerToken',{
         httpOnly:true,    
         Secure:process.env.NODE_ENV === "production", 
         sameSite:process.env.NODE_ENV === "production" ? 'none' : 'strict', 
         maxAge:7 * 24 * 60 * 60 * 1000,
     })

     return res.json({success:true,message:"Logged Out Successfully"})
   }catch(error){
      res.json({success:false,message:error.message})
   }
}




