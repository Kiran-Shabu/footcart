var db= require('../config/connection')
var collection= require('../config/collections')
const collections = require('../config/collections')
const objectId=require('mongodb').ObjectId

module.exports={


    dailySalesReport:()=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collections.order_collection).aggregate([
              {  $match:{
                    status:{$ne:'Canceled'}
                }
            },
            {
                $group:{
                    _id:'$date',
                    dailySaleAmount:{$sum:'$totalAmount'},
                    count:{$sum:1}
                }
            },
            {
                $sort:{
                    _id:-1
                }
            }
            ]).toArray().then((dailySales)=>{
                let totalamount=0
                dailySales.forEach(element =>{
                    totalamount += element.dailySaleAmount
                })
                console.log("ooooooooooooooooooooooooooooooooooooooooooooooooo");
                console.log(dailySales);
                dailySales.totalamount=totalamount
                resolve(dailySales)
            })

        })
    },



    monthlySalesReport:()=>{

        return new Promise((resolve, reject) => {
            db.get().collection(collections.order_collection).aggregate([
              {  $match:{
                    status:{$ne:'Canceled'}
                }
            },
            {
                $group:{
                    _id:'$month',
                    monthlySaleAmount:{$sum:'$totalAmount'},
                    count:{$sum:1}
                }
            },
            {
                $sort:{
                    _id:-1
                }
            }
            ]).toArray().then((monthlySales)=>{
                let totalamount=0
                monthlySales.forEach(element=>{
                    totalamount+= element.monthlySaleAmount
                });
                monthlySales.totalamount=totalamount
                console.log("ooooooooooooooooooooooooooooooooooooooooooooooooo");
                console.log(monthlySales);
                resolve(monthlySales)
            })

        })

    },


    yearlySalesReport:()=>{

        return new Promise((resolve, reject) => {
            db.get().collection(collections.order_collection).aggregate([
              {  $match:{
                    status:{$ne:'Canceled'}
                }
            },
            {
                $group:{
                    _id:'$year',
                    yearlySaleAmount:{$sum:'$totalAmount'},
                    count:{$sum:1}
                }
            },
            {
                $sort:{
                    _id:-1
                }
            }
            ]).toArray().then((yearlySales)=>{
                let totalamount=0
                yearlySales.forEach(element=>{
                    totalamount += element.yearlySaleAmount
                });
                yearlySales.totalamount=totalamount
                console.log("ooooooooooooooooooooooooooooooooooooooooooooooooo");
                console.log(yearlySales);
                resolve(yearlySales)
            })

        })

    }


}