import express from 'express'
import authUser from '../midleware/authUser.js'
import { getAlOrders, getUserOrders, placeOrderCOD, placeOrderStripe } from '../controllers/orderController.js'
import authSeller from '../midleware/authSeller.js'


const orderRouter = express.Router()

orderRouter.post('/cod',authUser,placeOrderCOD)
orderRouter.get('/user',authUser,getUserOrders)
orderRouter.get('/seller',authSeller,getAlOrders)
orderRouter.post('/stripe',authUser,placeOrderStripe)



export default orderRouter