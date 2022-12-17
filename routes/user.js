var express = require("express");
const { response } = require("../app");
const userHelpers = require("../helpers/user-helpers");
var router = express.Router();
var MongoClient = require("mongodb").MongoClient;
const productHelpers = require('../helpers/product-helpers');
const bannerHelpers = require('../helpers/banner-helpers');
const categoryHelpers = require("../helpers/category-helpers");
const orderHelpers = require("../helpers/order-Helpers")
const wishlistHelper = require("../helpers/wishlist-helpers")
const addressHelper= require("../helpers/address-helpers")
let YOUR_ACCOUNT_SID = process.env.twilioAccoundSID;
let YOUR_AUTH_TOKEN = process.env.twilioAuthToken;
let YOUR_SERVIECE_ID= process.env.twilioServiceId;
var voucher_codes = require('voucher-code-generator');
const dotenv= require('dotenv').config()

const paypal = require('paypal-rest-sdk');
const couponHelpers = require("../helpers/coupon-helpers");
const refrelHelpers = require("../helpers/refrel-helpers");

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': process.env.PaypalClientId,
  'client_secret': process.env.PaypalClientSecret
});

let usertransfer;
let err="";

const client = require("twilio")(YOUR_ACCOUNT_SID, YOUR_AUTH_TOKEN);

let errorMail;
const verifyLogin =(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }
  else
  {
     res.redirect('/login')
  }
}
/* GET home page. */
router.get("/", async function (req, res, next) {

  //
      let cartCount= null;
      let wishlistCount= null;
      bannerHelpers.getallbanner().then((banners)=>{
      categoryHelpers.getallcategory().then(async(data)=>{
        productHelpers.getallproducts().then(async(products)=>{  
      console.log(req.session.loggedIn);
      if(req.session.loggedIn==true){

         cartCount = await userHelpers.getCartCount(req.session.user._id);
        let person = req.session.user;
        wishlistCount= await wishlistHelper.getWishlistCount(req.session.user._id)
         cartCount = await userHelpers.getCartCount(req.session.user._id);
        res.render("user/user_homepage", { user: true ,data,banners,person,cartCount,wishlistCount,products});
        console.log("kkkkkkkkk");
        console.log(data);
      
         
      }
        else {
          res.render("user/user_homepage", { user: true ,data,banners,products});
        }
      
     
      })})})
   

  
});

// -----------------------------------Sign UP-----------------------------------------------------------

router.get('/sign-up',(req,res,next)=>{
  res.render('user/signup')
})


router.post("/signup", (req, res, next) => {
  req.body.status = true;
  console.log(req.body);
  userHelpers.addUser(req.body).then((result) => {
    console.log("oooooooooo");
    console.log(result);
    res.json(result);
  });
});


// -------------------------------------Login--------------------------------------------------------

router.get('/login',(req,res,next)=>{
  res.render('user/login')
  })

router.post("/login-verify", (req, res, next) => {
  console.log(req.body);
  userHelpers.getUsers(req.body).then((userdata) => {
    if (userdata.status == true && userdata.user.status == true) {
    req.session.user=userdata.user;
    req.session.loggedIn=true;

    let status ="success";
    res.json(status);
  } 
  else
  {
    if(userdata.status == false) {
      let status ="* Invalid user name or password";
      res.json(status);
    } else {
      let  status ="*user is blocked";
       res.json(status);
    }

  }

});
});
// -------------------------------------------Logout------------------------------------------------

router.get("/logout", function (req, res) {
 req.session.loggedIn = false
 delete req.session.user;
  res.redirect("/");
});

// ----------------------------------Casual Category-----------------------------------------------



router.get("/all_products", (req, res) => { 
  productHelpers.getallproducts().then(async(products)=>{
   let person=req.session.user
  
    
   if(req.session.loggedIn){
     cartCount = await userHelpers.getCartCount(req.session.user._id);
  res.render("user/casual_category", { user: true,products ,person,cartCount});
}
else{
 res.render("user/casual_category", { user: true,products });
}
}
)
})


router.get("/casual_category", (req, res) => { 
   productHelpers.getcasualproducts().then(async(products)=>{
    let person=req.session.user
   
     
    if(req.session.loggedIn){
      cartCount = await userHelpers.getCartCount(req.session.user._id);
   res.render("user/casual_category", { user: true,products ,person,cartCount});
}
else{
  res.render("user/casual_category", { user: true,products });
}
}
)
})

router.get("/formal_category", (req, res) => { 
  productHelpers.getformalproducts().then(async(products)=>{
   let person=req.session.user
  
    
   if(req.session.loggedIn){
     cartCount = await userHelpers.getCartCount(req.session.user._id);
  res.render("user/casual_category", { user: true,products ,person,cartCount});
}
else{
 res.render("user/casual_category", { user: true,products });
}
}
)
})

router.get("/sports_category", (req, res) => { 
  productHelpers.getSportsproducts().then(async(products)=>{
   let person=req.session.user
  
    
   if(req.session.loggedIn){
     cartCount = await userHelpers.getCartCount(req.session.user._id);
  res.render("user/casual_category", { user: true,products ,person,cartCount});
}
else{
 res.render("user/casual_category", { user: true,products });
}
}
)
})


// --------------------------------OTP------------------------------------------------------
router.get("/otplogin", (req, res) => {
  res.render("user/otp_login",{err});
  err="";
});



router.post("/sendcode", (req, res) => {
  console.log("||||||||||" + req.body.Rnumber);
  userHelpers.getmobilenmbr(req.body.Rnumber).then((response) => {
    console.log(response.status);
    usertransfer = response.user;
    console.log(usertransfer);
    if (response.status == true) {
      console.log("working");
      client.verify
        .services(YOUR_SERVIECE_ID) // Change service ID
        .verifications.create({
          to: `+91${req.body.Rnumber}`,
          channel: "sms",
        })
        .then((data) => {
          let response={
            message: "Verification is sent!!",
            phonenumber: req.body.Rnumber,
            data,
          }
          if(response)
          console.log(response);
          res.render('user/otp')

        });
    }
    else {
      err="Invalid Mobile Number"
      res.redirect('/otplogin')

    }
  });
});

router.post("/verify", (req, res) => {
  console.log('||||||||||'+req.body.code);
  client.verify
    .services(YOUR_SERVIECE_ID) // Change service ID
    .verificationChecks.create({
      to: `+91${usertransfer.Rnumber}`,
      code: req.body.code,
    })
    .then((data)=>{
      if(data.status==="approved") {
        console.log('???????????'+data.status);
        req.session.loggedIn=true;
        req.session.user=usertransfer
        res.redirect("/");
      }else{
        res.redirect('/otplogin')
      }
    }).catch((err)=>{
      console.log(err);
    })
});


// ------------------------------------------CART-------------------------------------------

router.get('/cart',verifyLogin,async(req,res)=>{
  console.log(';;;;;;;;;;;;;;;;;;;;;;;;;;;;');
  console.log(req.session.user);
  let products= await userHelpers.getCartProducts(req.session.user._id)
 console.log(products);
  let totalAmount= await userHelpers.getTotalAmount(req.session.user._id)
 let person=req.session.user
 console.log("************** "+ req.session.user._id);
  res.render('user/cart',{user:true,products,person,totalAmount})
})



router.get('/add-to-cart/:id',(req,res)=>{
  if(req.session.user)
  {
  console.log('api call');
  console.log(req.session.user);
  userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
    // res.redirect("/casual_category")
    res.json({status:true})
  })}
  else{
    console.log("aaaaaaaaaa");
    res.json({status:false})
  }
  })




router.post('/change-product-quantity',(req,res,next)=>{
  console.log(req.body);
  userHelpers.changeProductQuantity(req.body).then(async(response)=>{
    response.total=await userHelpers.getTotalAmount(req.body.user)
    res.json(response)
    
  })
})
 
router.post('/delete-product',(req,res,next)=>{
  userHelpers.deleteCartProduct(req.body).then((response)=>{
        res.json(response)
  })
})
// router.get('/deletecartproduct/:id',(req,res)=>{
//   let proId=req.params.id

//   userHelpers.deleteCartProduct(proId).then((response)=>{
//     res.redirect('/cart')
//   })


// -----------------------------------------------------------Product--------------------------------------------
router.get('/product/:i',async(req,res)=>{
  let PId=req.params.i
 
  console.log(PId);
  let product=await productHelpers.getProduct(PId)
  console.log(product);
    res.render("user/product",{user:true,product});


})



// ----------------------------------------------------Place Order---------------------------------------------------------------------------------------------------


router.get('/place-order',verifyLogin, async(req,res)=>{
  console.log("--------------------------");
  console.log(req.session.user._id);
  let addressList= await addressHelper.getUserAddress(req.session.user._id)
  let total=await userHelpers.getTotalAmount(req.session.user._id)
  let coupons= await couponHelpers.getAllCoupons(req.session.user._id)
  console.log("hhhhhhhhhhhhhhhhhhhhh");
  console.log(addressList);
  res.render('user/place-order',{user:true,total,user:req.session.user,addressList,coupons});
})

router.post('/place-order',async(req,res)=>{
  console.log(req.body);
  let products=await userHelpers.getCartProductList(req.body.userId)
  
  
  if(req.body.newTotal){
    totalPrice=parseFloat(req.body.newTotal)
    couponHelpers.pushUser(req.body.couponName,req.session.user._id)
    
  }
  else{

  
  totalPrice=await userHelpers.getTotalAmount(req.body.userId)
}
  console.log("kkkkkkkkkkkkkkkkkkkkkkkkkkk"+req.body.userId);
  orderHelpers.placeOrder(req.body,products,totalPrice).then(async(orderId)=>{
    console.log(orderId);
    if(req.body.paymentMethod=='COD'){
      let response={paymentMethod:"COD"}
      res.json(response)
    }else if(req.body.paymentMethod=='Razorpay')
    {
      console.log("jjhvgjgh");
      orderHelpers.generateRazorpay(orderId,totalPrice).then((data)=>{
        let response={paymentMethod:"Razorpay",
      razopayDetails:data}
        console.log("<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>")
        console.log(response);
          res.json(response)
      })
    }
    else if(req.body.paymentMethod=='Paypal')
    {
      data = await orderHelpers.generatePaypal(orderId,totalPrice)
        let response={
          paymentMethod:"Paypal",
            paypalDetails : data
      }
        res.json(response)  
  }
    
  })
})

router.post('/verify-payment',(req,res)=>{
  
  console.log(req.body)
  orderHelpers.verifyPayment(req.body).then(()=>{
    orderHelpers.updateOnlinepaymentStatus(req.body['order[receipt]']).then(()=>{
      console.log("Payment success");
      res.json({status:true})
    })
  }).catch((err)=>{
    console.log(err);
    res.json({status:false,errMsg:''})
  })
})

router.get('/success/:id', (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  let orderId = req.params.id; 

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
        "amount": {
            "currency": "USD",
            "total": "25.00"
        }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    console.log("11111111111111111111111111111111111111");
    console.log(orderId);
    if (error) {
        console.log(error.response);
        throw error;
    } else {
        console.log(JSON.stringify(payment));
        orderHelpers.updateOnlinepaymentStatus(orderId).then(()=>{
          res.redirect('/orderlist');
        })
       
    }
});
})

router.get('/cancel', (req, res) => res.redirect('/orderlist'));

// -----------------------------------------------orderlist----------------------------------------------------------

router.get('/orderlist',verifyLogin,async(req,res)=>{
  let orders=await orderHelpers.getUserOrders(req.session.user._id)
  res.render('user/orderlist',{user:req.session.user,orders})
})

router.get('/view-order-products/:id',verifyLogin,async(req,res)=>{

  let products= await orderHelpers.getOrderProducts(req.params.id)
  res.render('user/ordered-products',{user:req.session.user,products,user:true})
})

router.post('/verify-payment',(req,res)=>{
  console.log("qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq");
  console.log(req.body);

})


router.get('/cancel-order/:id',verifyLogin,(req,res)=>{
  let orderId= req.params.id

  orderHelpers.cancelOrder(orderId).then(()=>{
    res.redirect("/orderlist")
  })
})

router.get('/cancel-product/:id/:oid', verifyLogin,(req,res)=>{
  let orderid=req.params.id
  let proid=req.params.oid
  console.log("ggggggggggggggg");
  console.log(orderid);
  console.log(proid);
  orderHelpers.cancelProduct(orderid,proid).then(()=>{
    res.redirect('/view-order-products/'+orderid)
  })
})




// --------------------------------------------wishlist-----------------------------------------------------

router.get('/wishlist',verifyLogin,async(req,res)=>{
  let products= await wishlistHelper.getWishlistProducts(req.session.user._id)
  console.log("lllllllllll");
  console.log(products);
  res.render('user/wishlist',{user:true, products})
})

router.get('/add-to-wishlist/:id',verifyLogin,(req,res)=>{
  console.log('8888888888888888888');
  console.log(req.session.user);
  wishlistHelper.addToWishlist(req.params.id,req.session.user._id).then(()=>{
    // res.redirect("/casual_category")
    res.json({status:true})
   
  })

})

router.post('/delete-wishlist-product',(req,res,next)=>{
  wishlistHelper.deletewishListProduct(req.body).then((response)=>{
    console.log("2222222222");
    console.log(response);
        res.json(response)
  })
})

router.get('/remove-from-wishlist/:id',(req,res,next)=>{

})

// -----------------------------------------Address Managment---------------------------------------

router.post('/addAddress',(req,res)=>{
  req.body.status=true
  req.body.userId=req.session.user._id
  let address=req.body
  console.log(req.body);
  addressHelper.addNewAddress(address).then((newAddress)=>{
    res.json(newAddress)
  })
})

router.get("/getAddress/:id",(req,res)=>{
addressid=req.params.id
console.log("lllllllllllllllll");
console.log(addressid);
  addressHelper.getAddressDetails(addressid).then((fullDetails)=>{
    console.log(fullDetails);
    res.json(fullDetails)
  })

})

router.get("/getadd/:id",(req,res)=>{
  addid=req.params.id
  console.log("oooooo");
  addressHelper.getAddressDetails(addid).then((details)=>{
    console.log((details));
    res.json(details)
  })
})
router.post("/editAaddress/:id",(req,res)=>{
  adressid=req.params.id
  console.log("!!!!!!");
  console.log(adressid);
  console.log(req.body);

  addressHelper.updateAddress(adressid,req.body).then((details)=>{
    res.redirect('/dashboard')
  })
})


// ---------------------------------------------------------coupon-----------------------------------------------------

router.get("/applyCouponOffer/:id",(req,res)=>{
  couponid=req.params.id
  couponHelpers.getCouponDetails(couponid).then((coupondetails)=>{
    res.json(coupondetails)
  })
})




router.get('/dashboard',verifyLogin,async(req,res)=>{
  let addressList= await addressHelper.getUserAddress(req.session.user._id)
  let wallet= await refrelHelpers.walletDisplay(req.session.user._id)
  let User= await userHelpers.getUserProfileDetails(req.session.user._id)
res.render('user/dashboard',{user:true , addressList, wallet,User})
})

router.post('/edit-user',verifyLogin,async(req,res)=>{
  let userid=req.session.user._id
  let details=req.body
  console.log("lkjhghjjjjj");
  console.log(details);


  userHelpers.editUserProfile(userid,details).then((response)=>{
    res.json(response)

  })

})

// -------------------------search------------------------

router.get('/search',(req,res)=>{
  let search=req.query.q
  console.log("ppppppppp");
  console.log(search);
  productHelpers.searchProduct(search).then(async(products)=>{
    // res.render("user/casual_category", { user: true,products });
    if(req.session.loggedIn){
      cartCount = await userHelpers.getCartCount(req.session.user._id);
   res.render("user/casual_category", { user: true,products,cartCount});
}
else{
  res.render("user/casual_category", { user: true,products });
}
}
 ) })

module.exports = router;
