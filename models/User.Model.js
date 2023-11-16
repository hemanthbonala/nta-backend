const mongoose=require('mongoose')
const User=new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true},
    phoneNo:{type:String,required:true},
    DOB:{type:String,required:true},
    password:{type:String,required:true},
    securityQuestion:{type:String,required:true},
    securityAnswer:{type:String,required:true}
})

const model=mongoose.model('UserData',User);

module.exports=model