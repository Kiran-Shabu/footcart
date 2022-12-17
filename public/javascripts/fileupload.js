const multer= require('multer')

// handle storage using multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/pictures/product')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname + '-' + Date.now())
    }
});
 const upload = multer({ storage: storage });

 const storage2 = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/pictures/product/categoryimg')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname + '-' + Date.now())
    }
});
 const upload2 = multer({ storage: storage2 });

 const storage3 = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/pictures/product/bannerimg')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname + '-' + Date.now())
    }
});
 const upload3 = multer({ storage: storage3 });

 module.exports= {
    upload,
    upload2,
    upload3
};