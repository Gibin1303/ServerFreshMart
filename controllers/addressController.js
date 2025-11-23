import Address from "../models/address.js"





// add address
export const addressController = async(req,res)=>{
        try{
           const{address, userId} = req.body
           await Address.create({...address,userId})
           res.json({success:true,message:"Address Added Successfully"})
        }catch(error){
           console.log(error);
           res.json({success:false,message:error.message})           
        }
}


// get address


export const getAddress = async(req,res)=>{
       try{
              const{userId} = req.body
              const addressess = await Address.find({userId})
              res.json({success:true,addressess})

       }catch(error){
        console.log(error);
        res.json({success:false,message:error.message})           

       }
}