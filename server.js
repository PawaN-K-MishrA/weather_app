const express = require('express')
const app = express()
const mongoose = require('mongoose')
const bodyParser = require('body-parser');
const userRouter = require('./routes')
const http = require('http')
const server = http.createServer(app)

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));


app.all("/*", (request, response,next) => {
    response.header("Access-Control-Allow-Origin", "*");
    response.header(
      "Access-Control-Allow-Headers",
      "Content-Type, api_key, Authorization, x-requested-with, Total-Count, Total-Pages, Error-Message"
    );
    response.header(
      "Access-Control-Allow-Methods",
      "POST, GET, DELETE, PUT, OPTIONS"
    );
    response.header("Access-Control-Max-Age", 1800);
    next();
  });
  app.use('/user/',userRouter);

mongoose.connect("mongodb://localhost:27017/testdb", {
    useNewUrlParser: "true",
})
mongoose.connection.on("error", err => {
    console.log("err", err)
})
mongoose.connection.on("connected", (err, res) => {
    console.log("mongoose is connected")
})
const PORT = 3000
server.listen(PORT, () => {
console.log(`app is listening to PORT ${PORT}`)
})
