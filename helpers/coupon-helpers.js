var db = require('../config/connection')
const collections= require('../config/collections')
var collection = require('../config/collections')
const { response } = require('../app')
var objectId = require('mongodb').ObjectId
module.exports={

    addNEwCoupon:(coupon)=>{
      coupon.users=[]
         return new Promise(async(resolve, reject) => {
            coupon=await db.get().collection(collections.coupon_collection).insertOne(coupon).then((coup)=>{
                resolve(coup)
            })
         })
    },

    getAllCoupons:(userid)=>{
        return new Promise((resolve, reject) => {
           let coupons= db.get().collection(collections.coupon_collection).find({users:{$nin:[objectId(userid)]}}).toArray()
           resolve(coupons)
        })
    },

    getCouponDetails:(id)=>{
        return new Promise((resolve, reject) => {
            coupon=db.get().collection(collections.coupon_collection).findOne({_id:objectId(id)})
            resolve(coupon)
        })
   
},


  //  checkCoupen:(useriD, coupon,totalValue)=>{
  //   //  console.log(coupon);
  //   return new Promise((resolve,reject)=>{
  //     console.log('========= coupon =========')
  //     console.log(coupon)
  //     db.get().collection(collection.COUPEN_COLLECTION).findOne({couponCode:coupon}).then((coupendata)=>{
        
  //       console.log(coupendata);
        
  //   if(coupendata){
  //     let date = coupendata.date
  //    const cDate = new Date();
  //    function padTo2Digits(num) {
  //     return num.toString().padStart(2, '0');
  //     }
  //   const year = cDate.getFullYear();
  //   const month = padTo2Digits(cDate.getMonth() + 1);
  //   const day = padTo2Digits(cDate.getDate());
  
  //   let curentDate = [year, month, day].join('-');
  //   console.log(curentDate);
  
  //     db.get().collection(collection.USED_COUPON_COLLECTION).findOne({user:useriD,coupon:coupendata.couponCode}).then((usedCoupen)=>{
  //       console.log(usedCoupen);
  //       if (usedCoupen) {
  //         console.log("already used");
  //         resolve({usedCoupen:true})
          
  //       }else{
  //         if (date>curentDate) {
            
  //           console.log(coupendata.Percentage);
  //             discountPrice = (totalValue *coupendata.Percentage)/100;
  //             const couponPrice = totalValue - discountPrice;
  //             const usedObj = {
  //                 user: useriD,
  //                 coupon: coupendata.couponCode,
  //                 date: curentDate,
  //                 discount: discountPrice,
  //             };
  //             console.log(discountPrice);
  //             console.log(couponPrice);
  //             console.log(usedObj)
  
  
  //          db.get().collection(collection.USED_COUPON_COLLECTION).insertOne(usedObj)
  //          resolve({couponPrice,discountPrice})
             
        
          
  
  //         }else{
  //           console.log("expaired");
  //           resolve({expired:true})
  //         }
  //       }
  //     })
  
  //    }else{
  //     console.log("invalid coupen");
  //     resolve({invalid:true})
  //    }
     
  
  
    
        
  //       // resolve(coupendata)
  //     })
  //   })
  
  // },

  pushUser:(cname,userId)=>{
    console.log("llllllllll");
    console.log(userId);
    console.log(cname);
    return new Promise(async(resolve, reject) => {
      
      await db.get().collection(collections.coupon_collection).updateOne({CouponName:cname},
        {
          $push:{users:objectId(userId)}
        }
        ).then((data)=>{
          console.log("qqqqqqqqqqqqqqqqqqqqqqqqqqq");
          console.log(data);
        }
        )
    })
  }



}