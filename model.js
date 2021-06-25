const mongoose = require('mongoose')
const {encrypt} = require('./utils')
const bcrypt = require('bcryptjs')
const constant = require('./constants')


const userSchema = new mongoose.Schema({
name:{type:String,required:[true,"Enter your name here."],trim:true},
email:{type:String,required:[true,"Enter Your Email here."],trim:true},
password:{type:String,required:[true,"Enter your pwd"],trim:true},
key:{type:String},
favouriteCities:{type:String,default:''}
})

userSchema.pre("save", async function (next){
    let key_string = this.email+':'+constant.apiKey;
    console.log(key_string)
    this.key = encrypt(key_string)
    this.password = await bcrypt.hash(this.password,constant.salt);
    next();
})

const User = mongoose.model('User',userSchema);
module.exports = User;

