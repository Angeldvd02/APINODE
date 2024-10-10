//------ rutas.js----------------------------------------
//--- Rutas de acceso a nuestra API y sus métdos CRUD
const route = require("express").Router();
const rutacliente =  require("../controller/customercontroller");
const rutaordendetails = require("../controller/orderdetailscontroller");

// Routes​
route.use("/", rutacliente);//http://localhost:3300/
route.use("/", rutaordendetails);//http://localhost:3300/

module.exports=route;