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

// obtener orderdetails de una order
ruta.get('/orders/:orderNumber/orderdetails', (req, res) => {
    const { orderNumber } = req.params;
    const sql = `SELECT * FROM orderdetails WHERE orderNumber = ${orderNumber}`;
    conexion.query(sql, (error, results) => {
        if (error) throw error;
        if (results.length > 0) {
            res.json(results);
        } else {
            res.send('No hay resultados');
        }
    });
});

// metodo para sumar todas las ordenes SUM(quantityOrdered*priceEach), de la orden 
ruta.get('/orders/total/:orderNumber', (req, res) => {
    const { orderNumber } = req.params;
    const sql = `SELECT SUM(quantityOrdered*priceEach) as total FROM orderdetails WHERE orderNumber = ${orderNumber}`;
    conexion.query(sql, (error, results) => {
        if (error) throw error;
        if (results.length > 0) {
            res.json(results);
        } else {
            res.send('No hay resultados');
        }
    });
});
module.exports = ruta;