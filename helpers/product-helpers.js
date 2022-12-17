const { response } = require('../app')
const collections = require('../config/collections')

var db = require('../config/connection')
var objectId = require('mongodb').ObjectId
module.exports = {

    addProduct: (product) => {
        product.Pprice = parseInt(product.Pprice)
        product.stock =parseInt(product.stock)
        return new Promise((resolve, reject) => {
            db.get().collection(collections.product_collection).insertOne(product).then((data) => {

                resolve(data.insertedId)
            })
        })

    },
    getallproducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collections.product_collection).find().toArray()
            resolve(products)

        })
    },
    
    getcasualproducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collections.product_collection).find({pcategory:"Casuals"}).toArray()
            resolve(products)

        })
    },
    getformalproducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collections.product_collection).find({pcategory:"Formals"}).toArray()
            resolve(products)

        })
    },
    getSportsproducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collections.product_collection).find({pcategory:"Sports"}).toArray()
            resolve(products)

        })
    },


    deleteProduct: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.product_collection).deleteOne({ _id: objectId(proId) }).then((response) => {

                resolve(response)
            })

        })
    },

    getProduct: (product) => {
        return new Promise(async (resolve, reject) => {

            let a = await db.get().collection(collections.product_collection).findOne({ _id: objectId(product) })

            resolve(a)




        })


    },

    getProductDetails: (id) => {
        return new Promise(async (resolve, reject) => {

            let product = await db.get().collection(collections.product_collection).findOne({ _id: objectId(id) })

            resolve(product);
        })
    },

    updateProduct: (proId, proDetails) => {
        proDetails.Pprice=parseInt(proDetails.Pprice)
        proDetails.stock=parseInt(proDetails.stock)
        return new Promise((resolve, reject) => {
            db.get().collection(collections.product_collection)
                .updateOne({ _id: objectId(proId) }, {
                    $set: {
                        Pname: proDetails.Pname,
                        PBname: proDetails.PBname,
                        Pprice: proDetails.Pprice,
                        PofferPrice:proDetails.PofferPrice,
                        Psize: proDetails.Psize,
                        pcategory: proDetails.pcategory,
                        Pdis: proDetails.Pdis,
                        img: proDetails.img,
                        pcolor: proDetails.pcolor,
                        stock: proDetails.stock

                    }

                }).then((response) => {
                    resolve()
                })
        })
    },

    searchProduct:(key)=>{
        return new Promise(async(resolve, reject) => {
            let result = await db.get().collection(collections.product_collection).find({Pname:{$regex:'.*' + key + '.*', $options:'i'}}).toArray()
            console.log("rrrrrrrrrrrrr");
            console.log(result);
            resolve(result)
            
        })
    }

    

}




