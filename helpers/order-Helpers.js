var db = require('../config/connection')
var collection = require('../config/collections')
const response = require("../app")
const bcrypt = require('bcrypt')
const collections = require('../config/collections')
var objectId = require('mongodb').ObjectId
const Razorpay = require('razorpay');
const { time } = require('node:console')
const dotenv= require('dotenv').config()
var instance = new Razorpay({
    key_id: process.env.razorpayKeyId,
    key_secret: process.env.razorpayKeySecret
});

const paypal = require('paypal-rest-sdk');
const { loadavg } = require('node:os')
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': process.env.PaypalClientId,
    'client_secret': process.env.PaypalClientSecret
});
module.exports = {

    placeOrder: (order, products, total) => {
        return new Promise((resolve, reject) => {
            console.log(order, products, total);
            let status = order.paymentMethod === 'COD' ? 'Order placed' : 'pending';
            let datez = new Date()
            day = datez.getDate()
            month = datez.getMonth()
            year = datez.getFullYear()
            times = datez.getTime()
            date = `${day}/${month}/${year}`
            let orderObj = {
                deliveryDetails: {

                    mobile: order.Phone,
                    address: order.streetadd2,
                    pincode: order.pincode
                },
                userId: objectId(order.userId),
                name: order['Firstname'],
                paymentMethod: order['paymentMethod'],
                products: products,
                totalAmount: total,
                status: status,
                date: date,
                month: month,
                year: year,
                time: times


            }
            db.get().collection(collections.order_collection).insertOne(orderObj).then((response) => {
                
                products.forEach(element => {
                    let quantity=(0-element.quantity)
                    db.get().collection(collections.product_collection).updateOne({_id:objectId(element.item)},
                    {
                        $inc:{stock:quantity}
                    })
                    
                });
                console.log("ppppppppppppppppppppp");
                console.log(response);
                db.get().collection(collections.cart_Collection).remove({ user: objectId(order.userId) }).then((data) => {
                    console.log("22222222222222222222222");
                    console.log(data);
                    // console.log("order id:" ,response.ops[0]._id);
                    resolve(response.insertedId)
                })

            })
        })
    },

    getUserOrders: (userId) => {
        return new Promise(async (resolve, reject) => {
            console.log(userId);
            let orders = await db.get().collection(collections.order_collection)
                .find({ userId: objectId(userId) }).sort({"time":-1 }).toArray()
          
            resolve(orders)

        })
    },


    getOrderProducts: (orderId) => {

        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collections.order_collection).aggregate([
                {
                    $match: { _id: objectId(orderId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity',
                        status :'$products.productstatus'
                        

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
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] } ,status:1
                    }
                }


            ]).toArray()
            console.log("ordeeerrr iteemmm");
            console.log(orderItems);
            resolve(orderItems)
        })
    },


    getallOrders: () => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collections.order_collection).find().sort({"time":-1 }).toArray()
            resolve(orders)

        })
    },

     getOrderDetails: (id) => {
        return new Promise(async (resolve, reject) => {

            let details = await db.get().collection(collections.order_collection).findOne({ _id: objectId(id) })

            resolve(details);
        })
    },


    updateStatus: (orederId, orderDetails) => {
        console.log("0000000000000000000000000000");
        console.log(orderDetails);
        return new Promise((resolve, reject) => {
            db.get().collection(collections.order_collection)
                .updateOne({ _id: objectId(orederId) }, {
                    $set: {

                        status: orderDetails.status

                    }

                }).then((response) => {
                    resolve()
                })
        })
    },


    cancelOrder: (order) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.order_collection).updateOne({ _id: objectId(order) }, {
                $set: {
                    status: "Canceled"
                }
            }).then((response) => {
                resolve(response)
            })

        })
    },

    generateRazorpay: (orderId, total) => {
        return new Promise((resolve, reject) => {
            var options = {
                amount: total * 100,
                currency: "INR",
                receipt: orderId.toString(),
                notes: {
                    key1: "value3",
                    key2: "value2"
                }
            };
            instance.orders.create(options, function (err, order) {
                console.log("555555555555555555", order);
                resolve(order)
            });

        })

    },

    verifyPayment: (details) => {
        return new Promise(async (resolve, reject) => {
            const {
                createHmac
            } = await import('node:crypto');
            let hmac = createHmac('sha256', 'G6fANsJNxmx5dg7UZ0RpTNpx');
            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
            hmac = hmac.digest('hex')
            if (hmac == details['payment[razorpay_signature]']) {
                resolve()
            } else {
                reject()
            }
        })
    },

    updateOnlinepaymentStatus: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.order_collection)
                .updateOne({ _id: objectId(orderId) },
                    {
                        $set: {
                            status: 'placed'
                        }
                    }
                ).then(() => {
                    resolve()
                })
        })
    },



    generatePaypal: (orderId, total) => {
        return new Promise((resolve, reject) => {
            
        
        console.log("uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu");

        const create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "http://localhost:3000/success/"+orderId,
                "cancel_url": "http://localhost:3000/cancel"
            },
            "transactions": [{
                // "item_list": {
                //     "items": [{
                //         "name": "Red Sox Hat",
                //         "sku": "001",
                //         "price": "25.00",
                //         "currency": "USD",
                //         "quantity": 1
                //     }]
                // },
                "amount": {
                    "currency": "USD",
                    "total": total
                },
                "description": "Hat for the best team ever"
            }]
        };



        paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
                console.log("mmmmmmmmmmmmmmmmmmmmmmmmmm");
                throw error;
            } else {
                for (let i = 0; i < payment.links.length; i++) {
                    if (payment.links[i].rel == 'approval_url') 
                    {
                        console.log("ddddddddddddddddddddddddddddddd");
                        console.log()
                        let link = payment.links[i].href
                        resolve(link);
                    }
                }
            }
        })

    }

)},


cancelProduct: (order,pro) => {
   console.log("hai");
    return new Promise(async(resolve, reject) => {
        await db.get().collection(collections.order_collection).updateOne({_id: objectId(order), 'products.item':objectId(pro)  },
       {
        $set: {
                'products.$.productstatus': "Canceled"
                }
    }
                  
           
            
        ).then((hai) => {
            console.log("//////////////////////////");
            console.log(hai);
            resolve(hai)
        })
        })

    },
    updateProductStatus: (orederId,proid, orderDetails) => {
        console.log("0000000000000000000000000000");
        console.log(orderDetails);
        return new Promise((resolve, reject) => {
            db.get().collection(collections.order_collection)
                .updateOne({ _id: objectId(orederId), 'products.item':objectId(proid) }, {
                    $set: {

                        'products.$.productstatus': orderDetails.status

                    }

                }).then((response) => {
                    resolve()
                })
        })
    }





} 
