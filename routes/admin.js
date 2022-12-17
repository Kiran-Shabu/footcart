var express = require('express');
const userHelpers = require('../helpers/user-helpers');
var router = express.Router();
const categoryHelpers = require('../helpers/category-helpers')
const productHelpers = require('../helpers/product-helpers');
const bannerHelpers = require('../helpers/banner-helpers');
const { Router } = require('express');
const { upload, upload2, upload3 } = require('../public/javascripts/fileupload');
const orderHelpers = require('../helpers/order-Helpers');
const salesHelpers = require('../helpers/sales-helpers');
const offerHelpers = require('../helpers/offer-helpers');
const couponHelpers = require('../helpers/coupon-helpers');

const user = {
  Name: "Admin",
  Password: "123"
}

/* GET users listing. */
router.get('/', function (req, res, next) {

  if (req.session.loggedin) {
    res.redirect('/admin/home')
  } else {
    res.render('admin/admin');
  }



});

router.get('/home',async (req, res, next) => {
  if (req.session.loggedin) {
    let dailySales=await salesHelpers.dailySalesReport()
    let monthlySales=await salesHelpers.monthlySalesReport()
    let yearlySales=await salesHelpers.yearlySalesReport()
    console.log(dailySales);
    res.render('admin/admin-homepage', { admin: true ,dailySales,monthlySales,yearlySales})
  } else {
    res.redirect('/admin/');
  }

})


router.post('/home', function (req, res, next) {
  if (req.body.username === user.Name && req.body.password === user.Password) {
    error = ""

    req.session.loggedin = true;
    req.session.user = user.Name;
    users = req.session.user;
    res.render('admin/admin-homepage', { admin: true })
  } else {
    error = "Invalid Username or Password"
    res.redirect('/admin')
  }

});
// -------------------------------------------------user managment----------------------------------------------------------------
router.get('/usermanagment', (req, res, next) => {
  userHelpers.getallusers().then((data) => {
    res.render('admin/user_managment', { admin: true, data })
  })

})

router.get('/block/:id', (req, res) => {
  let userId = req.params.id
  userHelpers.blockUser(userId).then(() => {
    res.redirect('/admin/usermanagment')
  })
})

router.get('/unblock/:id', (req, res) => {
  userHelpers.unblockUser(req.params.id).then(() => {
    res.redirect('/admin/usermanagment')
  })

})


router.get('/dashboard', (req, res, next) => {
  res.render('admin/admin-homepage', { admin: true })
})

router.get('/logout', function (req, res) {
  req.session.loggedin = false
  res.redirect('/admin')
})

// ---------------------------------------------------- Banner managment------------------------------------------------------

router.get('/bannerlist', (req, res, next) => {
  bannerHelpers.getallbanner().then((data) => {
    console.log(data);
    res.render('admin/view_banner', { admin: true, data })
  })
})

router.get('/addbanner', (req, res) => {
  res.render('admin/add_banner', { admin: true })
})

router.post('/add-banner',upload3.array('Bimage'), (req, res, next) => {
  const banner = req.body
  console.log("555555555");
  console.log(banner);
banner.image = req.files[0].filename
  bannerHelpers.addBanner(banner).then((id) => {
   
        res.redirect("/admin/addbanner")
  })

  })
  router.get('/delete-banner/:id', (req, res) => {
    let bannerId = req.params.id
  
    bannerHelpers.deleteBanner(bannerId).then((response) => {
      res.redirect('/admin/bannerlist')
    })
  
  })
// ------------------------------------------------------product managment--------------------------------------------

router.get('/productlist', (req, res, next) => {
  productHelpers.getallproducts().then((data) => {
    res.render('admin/product_managment', { admin: true, data })
  })


})



router.get('/addproduct', (req, res, next) => {
  categoryHelpers.getallcategory().then((categories)=>{
    res.render('admin/add_product', { admin: true ,categories})
  })

})

router.post('/add-products', upload.array('image'), (req, res, next) => {
  const files = req.files
  console.log("++++++++++++++++++++++++++");
  console.log(files);

  const fileName = files.map((file) => {
    return file.filename
  
  })
  console.log("******************");
  console.log(fileName);

  const product = req.body
  product.img = fileName
  
  productHelpers.addProduct(product).then((id) => {


    res.redirect("/admin/addproduct" )


  })
})


router.get('/edit-product/:id', (req, res) => {
  productHelpers.getProductDetails(req.params.id).then((product) => {
    res.render('admin/edit-product', { admin: true, product })
  })

})

router.post('/edit-product/:id', upload.array('image'), (req, res) => {
  console.log(req.params.id);

  let id = req.params.id

  productHelpers.getProductDetails(req.params.id).then((products) => {

 
    if (req.files != 0) {
      const files = req.files

      const fileName = files.map((file) => {
        return file.filename
      })

      var product = req.body
      product.img = fileName

    }
    else {


      var product = req.body
      product.img = products.img


    }


    productHelpers.updateProduct(req.params.id, product).then(() => {
      res.redirect("/admin/productlist")
      

    })

  })
})

router.get('/delete-product/:id', (req, res) => {
  let proId = req.params.id

  productHelpers.deleteProduct(proId).then((response) => {
    res.redirect('/admin/productlist')
  })

})
// ------------------------------------------------------------ Category Managment------------------------------------------


router.get('/categorymanagment', (req, res, next) => {
  res.render('admin/add_category', { admin: true })
})
router.post('/add-category', upload2.any('Cimage'), (req, res, next) => {

 

 
  const category = req.body
  category.image = req.files[0].filename
  categoryHelpers.addCategory(req.body).then((id) => {
    console.log("pppppppppppppppp");
    console.log(req.body);

    res.redirect("/admin/categorymanagment")
  }



  )
}
)


router.get('/deletecat', (req, res, next) => {
  categoryHelpers.getallcategory().then((data) => {
    res.render('admin/delete_category', { admin: true, data })
  })

})

router.get('/delete-category/:id', (req, res) => {
  let catId = req.params.id

  categoryHelpers.deletecategory(catId).then((response) => {
    res.redirect('/admin/deletecat')
  })

})


router.get('/edit-category/:id', (req, res) => {
  categoryHelpers.getCategoryDetails(req.params.id).then((category) => {
    console.log(category);
    res.render('admin/edit-category', { admin: true, category })
  })
 
})

router.post('/edit-category/:id', upload2.any('Cimage'), (req, res) => {
  console.log(req.params.id);

  let id = req.params.id

  categoryHelpers.getCategoryDetails(req.params.id).then((Category) => {

    if (req.files != 0) {
      const files = req.files

      console.log(files);

      var category = req.body
      category.image = files[0].filename

    }
    else {

      var category = req.body
      category.image = Category.image
    }


    categoryHelpers.updateCategory(req.params.id, req.body).then(() => {
      res.redirect('/admin/deletecat')
      // if(req.files.image){
      //   let image=req.files.image
      //   console.log(image);
      //   console.log(id);
      //   image.mv('./public/category-images/'+id+'.jpg',(err,done)=>{
      //     if(!err){
      //       res.redirect('/admin/deletecat')
      //     }
      //     else {

      //       console.log(err);
      //     }

      // }) }
      // else {
      //   res.redirect('/admin/deletecat')
      // }
    })

  })
})

  // ----------------------------------------------- order managment--------------------------------------------------
  

  router.get('/manage-orders', (req, res) => {
    orderHelpers.getallOrders().then((allorders) => {
      console.log("Kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk");
      console.log(allorders);
      res.render('admin/manage-orders', { admin: true, allorders })
    })
  })

  router.get('/order-details/:id',async (req, res) => {
    
    orderHelpers.getOrderProducts(req.params.id).then((items) => {
      
      console.log("-----------------------------------");
      console.log(items);
      res.render('admin/order-details', { admin: true, items})
    })

  })


  router.post('/order-details/:id', (req, res) => {
    console.log("lllllllllllllllllllllllllllllll");
    console.log(req.params.id);
    console.log(req.body);


    let id = req.params.id

    orderHelpers.updateStatus(id, req.body).then(() => {
      console.log("]]]]]]]]]]]]]]]]]]]]]]]]]");
      console.log(req.body);
      res.redirect('/admin/manage-orders')

    })

  })

  router.post('/changeproductstatus/:id/:pid',(req,res)=>{
    console.log("]]]]]]]]]]]]]]]]]]]]]]]]]");
    console.log(req.body);
    let id = req.params.id
    let pid =req.params.pid
    console.log(id);
    console.log(pid);
    orderHelpers.updateProductStatus(id,pid,req.body).then(()=>{
      res.redirect('/order-details/'+id)
    })
  })
     
  // router.route('/login').get((res,req)=>{
  //   res.k
  // }).post().put

  router.get('/salesreport',async(req,res)=>{
    let dailySales=await salesHelpers.dailySalesReport()
    let monthlySales=await salesHelpers.monthlySalesReport()
    let yearlySales= await salesHelpers.yearlySalesReport()
    res.render('admin/sales-report',{ admin:true, dailySales,monthlySales, yearlySales})

  })



  // -------------------------------------------------product-offer---------------------------------------------------
  

  router.get("/productOffers", async(req,res)=>{
     productHelpers.getallproducts().then((datas)=>{
    res.render('admin/product-offers',{admin:true, datas})
  })
})

router.post("/productOffers/:id", async(req,res)=>{
  console.log("oooooooooooooooooo");
  let  proId=req.params.id
console.log(proId);
  console.log(req.body);
  offerHelpers.addProductOffer(proId,req.body).then(()=>{
    res.redirect('/admin/productOffers')
  })
})

router.get('/deleteProductOffer/:id',(req,res)=>{
  console.log("[[[[[[[[[[[[[[[[[[[[[[[");
  console.log(req.params.id);
  let id=req.params.id
  offerHelpers.deleteProductOffer(id).then((response)=>{
    res.redirect('/admin/productOffers')
  })
})

// --------------------------------------------------coupon-------------------------------

router.get('/addcoupon',(req,res)=>{
  res.render('admin/add-coupon',{admin:true})
})

router.post('/addcoupon',(req,res)=>{
  let coup=req.body
  console.log("lllllllllllll");
  console.log(req.body);
  couponHelpers.addNEwCoupon(coup).then((id)=>{
    res.redirect('/admin/addcoupon')
  })

})

router.get('/couponlist',(req,res)=>{
couponHelpers.getAllCoupons().then((coupons)=>{
  res.render('admin/coupon-list',{admin:true, coupons})
})

})


  module.exports = router;
