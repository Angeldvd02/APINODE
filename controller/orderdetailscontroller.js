const express = require("express");
const ruta = express.Router(); // Mejor usar express.Router() aquí
const conexion = require('../config/conexion');
const bodyParser = require('body-parser');

ruta.use(bodyParser.json());

// Listado de todos los customers
ruta.get('/orderdetails', function(req, res) {
    let sql = "SELECT * FROM orderdetails ORDER BY orderNumber";
    conexion.query(sql, (err, rows) => {
        if (err) {
            console.error('Error en la consulta SQL:', err);
            return res.status(500).json({ mensaje: 'Error en el servidor', error: err });
        }
        res.json(rows);
    });
});

module.exports = ruta;