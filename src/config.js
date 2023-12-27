
const mongoose = require('mongoose');
const connect = mongoose.connect(`mongodb://localhost:27017/honey-web`);


// check connected or not
connect.then(()=> {
    console.log('database connected successfully');
}).catch( (err)=> {
    console.log(`database connection failed`);
    console.log(err);
})
  
// create a schema
const loginSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});


const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type:String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})



// create a model
const collectionModel = new mongoose.model( 'users', loginSchema);

const adminModel = new mongoose.model( 'admins', adminSchema);


// exports
module.exports = { collectionModel, adminModel };