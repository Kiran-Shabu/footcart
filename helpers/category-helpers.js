const { response } = require('express')
const collections = require('../config/collections')

var db=require('../config/connection') 
var objectId=require('mongodb').ObjectId
module.exports={

    addCategory:(category)=>{
        console.log(category);
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.category_collection).insertOne(category).then((data)=>{
                console.log("datas////"+data);
                resolve(data.insertedId)
            })
        })
        

            
        },

        getallcategory:()=>{
            return new Promise(async(resolve, reject) => {
                let category=await db.get().collection(collections.category_collection).find().toArray()
                console.log("oooooooooo");
                console.log(category);
                resolve(category)
                
            }) 
        }  ,
        
        deletecategory:(catId)=>{
            return new Promise((resolve, reject) => {
                db.get().collection(collections.category_collection).deleteOne({ _id : objectId(catId)}).then((response)=>{
                    console.log(response);
                    resolve(response)
                })
                
            })
        },

        getCategoryDetails:(id)=>{
            return new Promise(async(resolve,reject)=>{
                
                let category = await db.get().collection(collections.category_collection).findOne({_id : objectId(id)})
            
                resolve(category);
            })
        },

        updateCategory:(catId,catDetails)=>{
            return new Promise((resolve, reject) => {
                db.get().collection(collections.category_collection)
                .updateOne({_id:objectId(catId)},{
                    $set:{
                        Cname:catDetails.Cname,
                        image: catDetails.image
                        

                    }

                }).then((response)=>{
                    resolve()
                   })
                })
            }

        



}