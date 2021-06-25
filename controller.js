const User = require('./model')
const async = require('async')
const {decrypt,parameterizedString} = require('./utils')
const constant = require('./constants')
const request = require('request')
const bcrypt = require('bcryptjs')

exports.home = (req,res)=>{
    res.send('Welcome to home Page.')
  }

exports.register = async(req,res)=>{
    try{
        let user = await User.findOne({email:req.body.email}).lean();
        if(user){
            throw new Error('Email must be unique.');
        }
        user = new User({
            name:req.body.name,
            email:req.body.email,
            password:req.body.password})
        
        await user.save((err,result)=>{
            if (err){
                throw new Error(err.message)
            }
            else{
                res.status(200).send(`${user.name} registred Sucessfully.`)
            }
        })
        
    }
    catch(err){
        res.send(err.message);
    }
}
exports.find = async(req,res)=>{
    try{
        let users = await User.find().lean()
        res.status(200).send(users)
    }
    catch(err){
        res.status(400).send(err.message)
    }
}

exports.login = async (req,res)=>{
    try{
        
        if (!req.body.email || !req.body.password){
            throw new Error('Email or Password is missing.')
        }
        let user = await User.findOne({email:req.body.email}).lean();
        
        if (!user || !(await bcrypt.compare(req.body.password,user.password))){
            throw new Error('Username or password is invalid.')
        }
        console.log(user)
        
        res.status(200).json({
            email:user.email,
            api_key:user.key,
            likedCities:user.favouriteCities
        })
    }
    catch(err){
        console.log(err)
        res.status(400).send(err.message);

    }

}

exports.byCity = async (req,res)=>{
    try{
        if(!req.body.api_key || !req.body.city){
            throw new Error('Api key missing, or city name is missing...')
        }
        let city = req.body.city
        let key = decrypt(req.body.api_key).split(':')[1]
        let url = parameterizedString(constant.byCityUrl,city,key)
        request(url,function(err,response,body){
            if (err){
                res.status(400).send(err.message)
            }
            else{
                res.status(200).send(body)
            }
        })
    }
    catch(err){
        console.log(err.message)
        res.status(400).send(err.message);
    }
}

exports.addCity = async (req,res) => {
    try{
        if(!req.body.city|| !req.body.api_key){
            throw new Error('Either City name or api_key is Invalid')
        }
        let userEmail = decrypt(req.body.api_key).split(':')[0]
        let user = await User.findOne({email:userEmail});
        let favourite = user.favouriteCities
        if (!favourite){
            favourite = req.body.city
        }
        else if(favourite.includes(req.body.city)){
            throw new Error('City already marked favourite.')
        }
        else{
            favourite = favourite+','+req.body.city
        }
        let updated = await User.findOneAndUpdate({email:userEmail},{favouriteCities:favourite})
        if (!updated){
            throw new Error ('Failed in update favourite city.')
        }
        else{
            res.status(200).send("City added to favourites")
        }
    }
    catch(err){
        res.status(400).send(err.message);
    }
}

exports.allFavourites = async(req,res)=>{
    try{
        const weatherAll =[]
        if(!req.body.api_key){
            throw new Error('api_key not provided.')
        }
        let details = decrypt(req.body.api_key).split(':')
        let userEmail = details[0]
        let key = details[1]
        let user = await User.findOne({email:userEmail});
        let favourite = user.favouriteCities.split(',')
        async.each(favourite,function(city,callback){
            let url = parameterizedString(constant.byCityUrl,city,key)
            request(url,function(err,response,body){
                if (err){
                    callback(err,null)
                }
                else{
                    weatherAll.push(JSON.parse(body))
                    callback(null,null)
                }
            })
        },function (err,result){
                if(err){
                    res.send(err.message)
                }
                else{
                    res.send(weatherAll)
                }
            }
        )
    }
    catch(err){
        res.status(400).send(err.message)
    }
}

