var db = require('../config/connection')
var collection = require('../config/collections')
const response = require("../app")
const bcrypt = require('bcrypt')
const collections = require('../config/collections')
var voucher_codes = require('voucher-code-generator');
var objectId = require('mongodb').ObjectId


module.exports = {
    //signup 
    addUser: (users) => {
        console.log(users);
        return new Promise(async (resolve, reject) => {
            let response = {
            }
            let count = await db.get().collection(collection.user_collection).count({ Remail: users.Remail })
            console.log(count);

            if (count != 0) {
                response.status = false;
                response.message = "Emaill Already Exist"
                resolve(response)
            } else {

                if (users.Refrel) {
                    referedPerson = await db.get().collection(collection.user_collection).findOne({ refrels: users.Refrel })
                    console.log("3333333333");
                    console.log(referedPerson);
                    if (referedPerson) {
                        let amt = parseInt(100)
                        refrelhelper.refrelcredit(referedPerson, amt)

                        refrel = voucher_codes.generate({
                            prefix: "footcart-",
                            postfix: "-2022"
                        });


                        users.Rpassword = await bcrypt.hash(users.Rpassword, 10)
                        users.refrels = refrel[0]
                        db.get().collection(collection.user_collection).insertOne(users)
                            .then((data) => {
                                console.log("@@@@@@@@@@@@@@@");
                                console.log(data.insertedId);
                                refrelhelper.addWallet(data.insertedId)
                                refrelhelper.addcredit(data.insertedId)
                                response.status = true;
                                response.message = ""

                                resolve(response)
                            })
                    } else {

                        resolve(response)
                    }



                }


                refrel = voucher_codes.generate({
                    prefix: "footcart-",
                    postfix: "-2022"
                });

                users.Rpassword = await bcrypt.hash(users.Rpassword, 10)
                users.refrels = refrel[0]
                db.get().collection(collection.user_collection).insertOne(users)
                    .then((data) => {
                        response.status = true;
                        response.message = ""
                        resolve(response)
                    })


            }
        })
    },
    getUsers: (user_details) => {
        return new Promise(async (resolve, reject) => {
            console.log(user_details)
            let user = await db.get().collection(collection.user_collection).findOne({ Remail: user_details.Remail })
            if (user) {
                bcrypt.compare(user_details.Rpassword, user.Rpassword).then((mandan) => {
                    console.log(mandan)
                    if (mandan) {
                        let response = {};
                        response.status = true
                        response.user = user
                        resolve(response)
                    }
                    else {
                        let response = {};
                        response.status = false;
                        resolve(response)
                    }
                })
            }
            else {
                let response = {}
                response.status = false
                resolve(response)
            }
        })


    },

    getallusers: () => {
        return new Promise(async (resolve, reject) => {
            let users = await db.get().collection(collection.user_collection).find().toArray()
            resolve(users)
        })
    },

    getmobilenmbr: (mobnmbr) => {
        return new Promise(async (resolve, reject) => {
            let count = await db.get().collection(collection.user_collection).count({ Rnumber: mobnmbr })
            console.log(count)
            if (count != 0) {
                db.get().collection(collection.user_collection).findOne({ Rnumber: mobnmbr }).then((user) => {
                    let response = {
                        message: "user identified",
                        status: true,
                        user: user
                    }
                    resolve(response)
                })
            }
            else {

                let response = {
                    message: "invalid Mobile Number",
                    status: false,

                }
                resolve(response);
            }
        });
    },


    blockUser: (user) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.user_collection).updateOne({ _id: objectId(user) }, {
                $set: {
                    status: false
                }
            }).then((response) => {
                resolve(response)
            })

        })
    },
    unblockUser: (user) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.user_collection).updateOne({ _id: objectId(user) }, {
                $set: {
                    status: true
                }
            }).then((response) => {
                resolve(response)
            })

        })
    },


  



    getCartProducts: (userId) => {

        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collections.cart_Collection).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
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
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }


            ]).toArray()
            console.log("inned");
            console.log(cartItems);
            resolve(cartItems)
        })
    },


    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            console.log(userId);
            let cart = await db.get().collection(collections.cart_Collection).findOne({ user: objectId(userId) })
            if (cart) {
                count = cart.products.length
            }
            console.log("++++++++++");
            console.log(count);
            resolve(count)
        })
    },





    addToCart: (proId, userId) => {
        let proObj = {
            item: objectId(proId),
            quantity: 1,
            productstatus: "product placed"
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collections.cart_Collection).findOne({ user: objectId(userId) })
            console.log(';;;;;;')
            console.log(userCart);
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == proId)
                console.log(proExist);
                if (proExist != -1) {
                    db.get().collection(collections.cart_Collection)
                        .updateOne({ 'products.item': objectId(proId) },
                            {
                                $inc: { 'products.$.quantity': 1 }
                            }
                        ).then(() => {
                            resolve()
                        })
                } else {
                    db.get().collection(collections.cart_Collection)
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
                db.get().collection(collection.cart_Collection).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }
        })
    },


    changeProductQuantity: (details) => {
        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)
        console.log(details.cart);
        console.log(details.product);
        return new Promise((resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {
                db.get().collection(collections.cart_Collection)
                    .updateOne({ _id: objectId(details.cart) },
                        {
                            $pull: { products: { item: objectId(details.product) } }
                        }
                    ).then((response) => {
                        resolve({ removeProduct: true })
                    })

            } else {
                db.get().collection(collections.cart_Collection)
                    .updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
                        {
                            $inc: { 'products.$.quantity': details.count }
                        }
                    ).then((response) => {
                        resolve({ status: true })
                    })
            }
        })
    },


    deleteCartProduct: (details) => {

        return new Promise((resolve, reject) => {

            db.get().collection(collections.cart_Collection)
                .updateOne({ _id: objectId(details.cart) },
                    {
                        $pull: { products: { item: objectId(details.product) } }
                    }
                ).then((response) => {
                    resolve({ removeProduct: true })
                })
        })
    },


    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            console.log(userId);
            let total = await db.get().collection(collections.cart_Collection).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
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
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', '$product.Pprice'] } }

                    }
                }



            ]).toArray()
            console.log("=======================");
            console.log(total);
            if (total[0] == null) {
                total = 0
                resolve(total)
            } else {
                resolve(total[0].total)

            }
        })

    },




    getCartProductList: (userId) => {
        return new Promise(async (resolve, reject) => {
            console.log("[[[[[[[[[[[[[[[[[[[[[[[[[");
            console.log(userId);
            let cart = await db.get().collection(collections.cart_Collection).findOne({ user: objectId(userId) })
            console.log("jjjjjjjjjjjjjjjjjjjjjjjjjjjj");
            console.log(cart);

            resolve(cart.products)
        })
    },


    getUserProfileDetails: (userid) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collections.user_collection).findOne({ _id: objectId(userid) })
            resolve(user)

        })

    },

    editUserProfile: (userid, details) => {
        return new Promise(async (resolve, reject) => {
            let response = {};
            let user = await db.get().collection(collections.user_collection).findOne({ _id: objectId(userid) })

            if (user) {

                 bcrypt.compare(details.Rpassword, user.Rpassword).then(async(person) => {
                    console.log(person)
                    if (person) {
                        if (details.newPass == details.renwPass) {
                            details.newPass = await bcrypt.hash(details.newPass, 10)
                            console.log("asdsasssaaaaaaa");
                            console.log(details.newPass);
                            db.get().collection(collections.user_collection).updateOne({ _id: objectId(userid) }, {
                                $set: {
                                    Rpassword: details.newPass

                                }
                            }).then((response)=>{
                                response.status = true;
                                response.message = ""
                                resolve(response)
                            })
                        } else {
                            response.status = false;
                            response.message = "password does not match"
                            resolve(response)
                        }
                    }
                    else {
                        response.status = false;
                        response.message = "Entered password is wrong"
                        resolve(response)

                    }
                })
            }
            else {
                response.status = false;
                response.message = "something went wrong"
                resolve(response)
            }
           
           
        })
    }
}
