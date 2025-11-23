import Order from "../models/order.js"
import Product from "../models/product.js"
import stripe from 'stripe'
import User from "../models/user.js"


// PLACE  order Cod
export const placeOrderCOD = async(req,res)=>{
    try{
      const{userId,items,address}=req.body

      if(!address || items.length === 0){
        return res.json({success:false,message:"Invalid Data"})
      }

    //   calculate amount using items

    let amount = await items.reduce(async(acc, item)=>{
      const product = await Product.findById(item.product)
       return ( acc) + product.offerPrice*item.quantity
    },0)

    // tax charge
  
    amount += Math.floor(amount*0.02)

    await Order.create({
        userId,
        items,
        amount,
        address,
        paymentType:"COD"
    })

    return res.json({success:true, message:"Order Placed Successfully"})

    }catch(error){
      res.json({success:false,message:error.message})
    }
}


// place order stript-online

export const placeOrderStripe = async(req,res)=>{
  try{
    const{userId,items,address}=req.body
    const{origin}=req.headers

    if(!address || items.length === 0){
      return res.json({success:false,message:"Invalid Data"})
    }

  //   calculate amount using items

  let productData = []

  let amount = await items.reduce(async(acc, item)=>{
    const product = await Product.findById(item.product)
    productData.push({
      name:product.name,
      price:product.offerPrice,
      quantity:item.quantity
    })
     return ( acc) + product.offerPrice*item.quantity
  },0)

  // tax charge

  amount += Math.floor(amount*0.02)

  await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType:"Online"
  })

  // stripe gateway Initilze

  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)

  // create line items for stripe

  const line_items = productData.map((item)=>{
    return {
      price_data:{
        currency:"INR",
        product_data:{
          name:item.name
        },
        unit_amount: Math.floor(item.price + item.price * 0.02) * 100
      },
      quantity:item.quantity
    }
  })

  // create session

  const session = await stripeInstance.checkout.sessions.create({
    line_items,
    mode:"payment",
    success_url:`${origin}/loader?next=my-orders`,
    cancel_url:`${origin}/cart`,
    metadata:{
      orderId: Order._id,
      userId,
    }

  })

  return res.json({success:true, url: session.url})

  }catch(error){
    res.json({success:false,message:error.message})
  }
}


// stripe webhook to verify payment action

export const stripeWebHook = async(request,response)=>{
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)

  const sig = request.headers["stripe-signature"]
  let event


  try{
      event = stripe.webhooks.constructEvent(
        request.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      )
  }catch(error){
     res.status(400).send(`Webhook Error: ${error.message}`)
  }

  // Handle the Event

  switch(event.type){
    case "payment_intent.succeeded":{
      const paymentIntent = event.data.object
      const paymentIntentId = paymentIntent.id

      // geting session metadata

      const session  = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      })

      const{orderId,userId} = session.data[0].metadata

      // mark payment paid

      await Order.findByIdAndUpdate(orderId,{isPaid:true})
      // clear user cart
      await User.findByIdAndUpdate(userId,{cartItems:{}})

      break;
    }

    case "payment_intent.payment_failed":{
      const paymentIntent = event.data.object
      const paymentIntentId = paymentIntent.id

      // geting session metadata

      const session  = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      })

      const{orderId} = session.data[0].metadata
      await Order.findByIdAndDelete(orderId)

      break

    }



    default:
       console.error(`Unhandled event type ${event.type}`)
      break
  }

  res.json({received: true})
}
// get orders by userId

export const getUserOrders = async(req,res)=>{
    try{
      const{userId}  =req.body
      const orders = await Order.find({
        userId, $or: [{paymentType:"COD"},{isPaid:true}]
      }).populate("items.product address").sort({createdAt: -1})
      res.json({success:true,orders})
    }catch(error){
        res.json({success:false,message:error.message})

    }
}


// get all orders

export const getAlOrders = async(req,res)=>{
    try{
      const orders = await Order.find({ $or: [{paymentType:"COD"},{isPaid:true}]}).populate("items.product address").sort({createdAt: -1})
      res.json({success:true,orders})
    }catch(error){
        res.json({success:false,message:error.message})

    }
}

