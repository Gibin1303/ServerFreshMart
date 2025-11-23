import express from 'express'
import authUser from '../midleware/authUser.js'
import { addressController, getAddress } from '../controllers/addressController.js'


const addressRouter = express.Router()


addressRouter.post('/add',authUser,addressController)
addressRouter.get('/get',authUser,getAddress)

export default addressRouter