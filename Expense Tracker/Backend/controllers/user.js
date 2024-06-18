const User = require('../models/user');
const FilesDownloaded = require('../models/filesdownloaded')

const bcrypt = require("bcrypt");
const saltRounds = 10;

const jwt = require('jsonwebtoken');
const dotenv =  require("dotenv");
dotenv.config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY

exports.postSignUp = async (req,res,next) => {
    try{
        const { name, email, phone, password } = req.body
        const oldUser = await User.findOne({
            email : email
        })
        if(oldUser){
            res.status(404).json({message : "User Already Exists !!"})
        }
        else{
            bcrypt.hash(password,saltRounds,async (err,hash) => {
                const user = new User({
                    name : name,
                    email : email,
                    phone : phone,
                    password : hash,
                    totalExpenses : 0
                })
                await user.save()
                res.status(200).send()      
            })
        }
    }
    catch(err){
        console.log(err);
    }
}

function generateAccessToken(id,name){
    return jwt.sign({ id: id, name : name}, JWT_SECRET_KEY)
}


exports.postLogin = async (req,res,next) => {
    try{
        const email = req.body.email;
        const password = req.body.password;
        const user = await User.findOne({ email : email })
        if(!user){
            res.status(404).json({message : "User Not Found !!!"})
        }
        else{
            bcrypt.compare(password,user.password, (err,result) => {
                if(result){
                    res.status(200).json({message : "user Found",token : generateAccessToken(user.id, user.name) })
                }
                else{
                    res.status(401).json({message : "Incorrect Password !!"})
                }
            })
        }
    }
    catch(err){
        console.log(err);
    }
}

exports.getPremium = (req,res,next) => {
    const user = req.user;
    if(user){
        return res.status(200).json({isPremium : user.isPremium})
    }
}

exports.getFilesDownloaded = async (req, res, next) => {
    try{
        const user = req.user;
        const filesdownloaded = await FilesDownloaded.find({ userId : user.id }).select('fileUrl date')
        res.status(200).json(filesdownloaded)
    }
    catch(err){
        console.log(err);
    }
}