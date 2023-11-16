const express=require('express')
const app=express()
const cors=require('cors')
const mongoose=require('mongoose')
const User=require('./models/User.Model')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const cookieParser=require('cookie-parser')
const cookiesMiddleware = require('universal-cookie-express');;



// function formatDate(date) {
//     var d = new Date(date),
//       month = '' + (d.getMonth() + 1),
//       day = '' + d.getDate(),
//       year = d.getFullYear();

//     if (month.length < 2) 
//       month = '0' + month;
//     if (day.length < 2) 
//       day = '0' + day;

//     return [year, month, day].join('-');
//   }

require('dotenv').config()
mongoose.connect(process.env.DB_URL);

app.use(cors())
app.use(express.json())
app.use(cookieParser());   
app.use(cookiesMiddleware())


app.post('/api/login',(async (req,res)=>{
    // console.log(req.body);
    const newUser=req.body;
    console.log(newUser['date']);
    date=new Date(newUser['date'])
    // console.log(date.toLocaleDateString());
    console.log(date);
    const saltrounds=((newUser['pwd'].length)%5)+3;
    let hashed_pwd=""
    await bcrypt.hash(newUser['pwd'],saltrounds).then((hash)=>{
        hashed_pwd=hash
    }).catch((err)=>{
        console.log(err);
    })
    const user=await User.findOne({
        email:newUser['user'],
        
    })
    if(user){
        const valid=await bcrypt.compare(newUser['pwd'],hashed_pwd);
        
        res.json({status:"ok",password:valid,message:'account already available'})
        
    }
    else{
        let hashed_answer=""
        await bcrypt.hash(newUser['securityAnswerLower'],saltrounds).then((result)=>{hashed_answer=result}).catch((err)=>{
            console.log(err);
            res.status(400);
            res.json({status:"not ok",message:"error in hashing"})

        });
            
        await User.create({
        name:newUser['fullname'],
        DOB:newUser['date'],
        email:newUser['user'],
        phoneNo:newUser['phone'],
        password:hashed_pwd,
        securityQuestion:newUser['selectedSecurityQuestion'],
        securityAnswer:hashed_answer
    })
    res.json({status:'ok',message:'account created'})

}
}))
app.post('/api/verify',(async (req,res)=>{
    const newUser=req.body;
    const user=await User.findOne({
        email:newUser['user'],
        
    })
    if(user){

        const valid=await bcrypt.compare(newUser['pwd'],user.password);
        console.log(valid);
        if(valid){
            let data = { 
                email: newUser['user'], 
            } 
            const secretKey=process.env.SECRET_KEY;
            const access_token=jwt.sign(data,secretKey,{expiresIn:'2d'});
            console.log(access_token);
            // res.cookie('access_token',access_token,{
            //     httpOnly:true
            // });
            // cookieParser.cookies.set('access_token',access_token);
            
        res.status(200);
        res.json({status:"ok",password:valid,message:'access granted',token:access_token})
        }
        else{
            console.log();
            res.status(404);
            res.json({status:"not valid",password:valid,message:'Enter valid credentials'})
        }    
    }
    else{
        // console.log(req.cookies());
        res.status(404)
        res.json({status:404,message:'enter valid credentials'})
    }

}))
app.post('/api/forgot',async (req,res)=>{
    const newUser=req.body;
    const user=await User.findOne({
        email:newUser['user']
    })
    if(user){
        // res.send({})
        // console.log(user.securityQuestion);
        const question=user.securityQuestion;
        res.json({status:200,message:"account available",'question':question})
        
    }
    else{
        res.json({status:404,message:"account not available"})
    }

})

app.post('/api/checkAnswer',async (req,res)=>{
    const input=req.body;
    const answer=input['securityAnswerLower'];
    const mail=input['email'];
    const user=await User.findOne({
        email:mail
    })
    const valid=await bcrypt.compare(answer,user.securityAnswer);
    if(valid){
        res.json({status:200})

    }
    else{
        res.json({status:400})
    }
   
})
app.post('/api/updatePassword',async (req,res)=>{
    const input=req.body;
    const saltrounds=((input['newPassword'].length)%5)+3;
    const new_hashed_pwd=await bcrypt.hash(input['newPassword'],saltrounds);
    console.log(input['newPassword']);
    console.log(input['user']);
    filter={email:input['user']}
    try{
    const ouput=await User.findOneAndUpdate({email:input['user']},{password:new_hashed_pwd},{
        new:true
    });
    console.log(ouput);
    res.json({status:200,message:"password updated"})
    }
    catch(err){
        console.log(err);
        res.json({status:400,message:"password not updated"})
    }


})

// not completed
app.post('/api/verifyCookie', async (req,res)=>{
    const token=await req.universalCookies.get('access_token');
    console.log("token "+token);
})


app.listen(3500,()=>{
    console.log("server started for minor project ");
})