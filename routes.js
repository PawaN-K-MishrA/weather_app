const express = require('express')
const cors = require('cors')
const router = express.Router()
const controller = require('./controller')

router.use(cors());
router.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  });
router.get('/home',controller.home)
router.post('/register',controller.register);
router.get('/all',controller.find);
router.post('/login',controller.login);
router.post('/getWeatherByCity',controller.byCity);
router.post('/addToFavourites',controller.addCity);
router.post('/allFavouriteCityWeather',controller.allFavourites); 

module.exports = router;

