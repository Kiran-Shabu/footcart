const { response } = require('../app')
const collections = require('../config/collections')

var db = require('../config/connection')
var objectId = require('mongodb').ObjectId
module.exports = {




    addToWishlist: (proId, userId) => {
        let proObj = {
            item: objectId(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userWishList = await db.get().collection(collections.wishlist_collection).findOne({ user: objectId(userId) })
            console.log(';;;;;;')
            console.log(userWishList);
            if (userWishList) {
                let proExist = userWishList.products.findIndex(product => product.item == proId)
                console.log(proExist);
                if (proExist != -1) {
                    db.get().collection(collections.wishlist_collection)
                        .updateOne({ 'products.item': objectId(proId) },
                            {
                                $pull: { products: proObj }
                            }
                        ).then(() => {
                            resolve()
                        })
                } else {
                    db.get().collection(collections.wishlist_collection)
                        .updateOne({ user: objectId(userId) },
                            {

                                $push: { products: proObj }

                            }
                        ).then((response) => {
                            resolve()
                        })
                }
            }
            else {
                let cartObj = {
                    user: objectId(userId),
                    products: [proObj]
                }
                db.get().collection(collections.wishlist_collection).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }
        })
    },


    getWishlistCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            console.log(userId);
            let wishlist = await db.get().collection(collections.wishlist_collection).findOne({ user: objectId(userId) })
            if (wishlist) {
                count = wishlist.products.length
            }
            console.log("77777777777777777777777777777777");
            console.log(count);
            resolve(count)
        })
    },


    getWishlistProducts: (userid) => {
        return new Promise(async (resolve, reject) => {
            let wishlistItems = await db.get().collection(collections.wishlist_collection).aggregate([
                {
                    $match: {
                        user: objectId(userid)
                    }

                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item'
                    }
                },
                {
                    $lookup: {
                        from: collections.product_collection,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ]).toArray()
            resolve(wishlistItems)
        })
    },

    deletewishListProduct: (details) => {

        return new Promise((resolve, reject) => {

            db.get().collection(collections.wishlist_collection)
                .updateOne({ _id: objectId(details.wishlist) },
                    {
                        $pull: { products: { item: objectId(details.product) } }
                    }
                ).then((response) => {
                    resolve({ removeProduct: true })
                })
        })
    },





    removeFromWishlist: () => {

    }
}