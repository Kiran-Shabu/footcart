const collections = require('../config/collections')
const collection= require('../config/collections')
var db= require('../config/connection')
var objectId = require('mongodb').ObjectId
var voucher_codes = require('voucher-code-generator');
module.exports={

addWallet:(userid)=>{
    return new Promise(async(resolve, reject) => {
       await db.get().collection(collection.wallet_collection).insertOne({
            userId: userid,
            balance :parseInt(0),
            transaction:[]
        })
        
    })

},


addcredit:(userid)=>{
    return new Promise(async(resolve, reject) => {
      refreldata={
        amount: parseInt(50),
        date: new Date().toDateString(),
        Timestamp: new Date(),
        status: "credited",
        message:"Refrel Amount"
      }
      await db.get().collection(collection.wallet_collection).updateOne({userId:objectId(userid)},
      {
        $inc:{
            balance:parseInt(50)
        },
        $push:{
            transaction:refreldata

        }
      })
    })
},

refrelcredit:(reff,amount)=>{
    return new Promise(async(resolve, reject) => {
        let refferal=await db.get().collection(collection.user_collection).findOne({refrels:reff.refrels})
        if(refferal){
            refreldata={
             amount:amount,
             date:new Date().toDateString(),
             Timestamp:new Date(),
             status:"credited",
             message:"Refrel Amount"
         }
         db.get().collection(collection.wallet_collection).updateOne({userId:refferal._id},{
             $inc:{
                 balance:amount
             },
             $push:{
                transaction:refreldata
             }
         })
         }
    })
},


walletDisplay:(userid)=>{
    return new Promise(async(resolve, reject) => {
        let wallet = await db.get().collection(collection.wallet_collection).findOne({userId:objectId(userid)})
        resolve(wallet)
    })

}



}