const MongoClient=require('mongodb').MongoClient
const state={
    db:null
}
module.exports.connect=function(done){
    const url = 'mongodb+srv://kiranshabu:kiran123@cluster0.ozmtqu4.mongodb.net/test';
    const dbname='footkart'

    MongoClient.connect(url,(err,data)=>{
        if(err){
            return done(err)
        }
        state.db=data.db(dbname)
    })
    done()
}

module.exports.get=()=>{
    return state.db
}

