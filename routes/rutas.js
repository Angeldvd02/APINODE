//------ rutas.js----------------------------------------
//--- Rutas de acceso a nuestra API y sus métdos CRUD
const route = require("express").Router();
const rutacliente =  require("../controller/customercontroller");
// Routes​
route.use("/", rutacliente);//http://localhost:3300/
module.exports=route;