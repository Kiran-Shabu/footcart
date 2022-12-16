const collections = require('../config/collections')
const collection= require('../config/collections')
var db= require('../config/connection')
var objectId = require('mongodb').ObjectId
module.exports={

    addNewAddress:(address,id)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collections.address_collection).insertOne(address).then((add)=>{
                
                resolve(add)
            })
        })
    },
    getUserAddress:(Id)=>{
        return new Promise(async (resolve, reject) => {
           let addresses= await db.get().collection(collections.address_collection).find({userId:Id}).toArray()
           console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
           console.log(addresses);
           resolve(addresses)
        })
    },

    getAddressDetails:(addId)=>{
        return new Promise (async(resolve,reject)=>{
            let fullAddress = await db.get().collection(collections.address_collection).findOne({_id:objectId(addId)})

            resolve(fullAddress)
           
    })
    
},


  updateAddress:(addid,details)=>{
    return new Promise(async(resolve, reject) => {
        await db.get().collection(collections.address_collection).updateOne({_id:objectId(addid)},{

            $set:{
                Firstname:details.Firstname,
                Lastname:details.Lastname,
                companyname:details.companyname,
                countryname:details.countryname,
                streetadd1:details.streetadd1,
                streetadd2:details.streetadd2,
                town:details.town,
                state:details.state,
                pincode:details.pincode,
                Phone:details.Phone,
                email:details.email,

            }
        }).then((response)=>{
            resolve()
        })
        
    })
  }

}