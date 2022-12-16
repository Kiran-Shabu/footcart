const { response } = require('express')
const collections = require('../config/collections')

var db=require('../config/connection') 
var objectId=require('mongodb').ObjectId
module.exports={

    addBanner:(banner)=>{
        console.log(banner);
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.banner_collection).insertOne(banner).then((data)=>{
                console.log("datas////"+data);
                resolve(data.insertedId)
            })
        })
        

            
        },

        getallbanner:()=>{
            return new Promise(async(resolve, reject) => {
                let banner=await db.get().collection(collections.banner_collection).find().toArray()
                resolve(banner)
                
            }) 
        }    


}
