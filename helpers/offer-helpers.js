var db = require('../config/connection')
var collection = require('../config/collections')
const response = require("../app")
const bcrypt = require('bcrypt')
const collections = require('../config/collections')
const { PlayerStreamerInstance } = require('twilio/lib/rest/media/v1/playerStreamer')
var objectId = require('mongodb').ObjectId

module.exports={

    
    addProductOffer:(product,percentage)=>{
        return new Promise(async(resolve, reject) => {
            
            let x=parseInt(percentage.persent)
            let products= await db.get().collection(collections.product_collection).findOne({_id:objectId(product)})
            let oldprice=products.Pprice
            let offer=products.Pprice-(products.Pprice*(x/100))
            offer=Math.round(offer)
            db.get().collection(collections.product_collection).updateOne({_id:objectId(product)},{$set:{Pprice:offer , per:x, oldprice:oldprice}
        }).then(()=>{

            resolve()
        })

            
        })
    },

    deleteProductOffer:(pid)=>{
        return new Promise(async(resolve, reject) => {
            Product= await db.get().collection(collections.product_collection).findOne({_id:objectId(pid)})
            console.log("kkkkkkkkkkkkkkkkkk");
            console.log(Product);
            let oldprices= Product.oldprice
            db.get().collection(collections.product_collection).updateOne({_id:objectId(pid)},{$unset:{oldprice:""},$set:{
                Pprice:oldprices
            }
        }).then(()=>{
            resolve(response)
        })
        })
    }

}