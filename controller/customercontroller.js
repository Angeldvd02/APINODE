const express = require("express");
const ruta = express.Router(); // Mejor usar express.Router() aquí
const conexion = require('../config/conexion');
const bodyParser = require('body-parser');

ruta.use(bodyParser.json());

// Ruta base para probar si la API está funcionando
ruta.get('/', function(req, res) {
    res.json({ mensaje: '¡Estoy en Index!' });
});

// Listado de todos los customers
ruta.get('/customers', function(req, res) {
    let sql = "SELECT * FROM customers ORDER BY customerNumber";
    conexion.query(sql, (err, rows) => {
        if (err) {
            console.error('Error en la consulta SQL:', err);
            return res.status(500).json({ mensaje: 'Error en el servidor', error: err });
        }
        res.json(rows);
    });
});

ruta.get('/customers/orders', (req, res) => {
    const sql = 'SELECT * FROM customers ORDER BY customerNumber';
    conexion.query(sql, (error, results) => {
        if (error) throw error;
        if (results.length > 0) {
            let processedCustomers = 0;
            results.forEach(customer => {
                const sqlOrders = `SELECT orderNumber, 
                                          DATE_FORMAT(orderDate, '%d-%m-%Y') as orderDate, 
                                          status 
                                   FROM orders 
                                   WHERE customerNumber = ${customer.customerNumber}`;
                
                conexion.query(sqlOrders, (error, orders) => {
                    if (error) throw error;
                    
                    let processedOrders = 0;
                    customer.orders = [];

                    // Para cada orden, obtenemos el total
                    orders.forEach(order => {
                        const sqlTotal = `SELECT SUM(quantityOrdered * priceEach) AS total 
                                          FROM orderdetails 
                                          WHERE orderNumber = ${order.orderNumber}`;
                        
                        conexion.query(sqlTotal, (error, totalResults) => {
                            if (error) throw error;
                            
                            order.total = parseFloat(totalResults[0].total).toFixed(2); // Agregamos el total a la orden
                            customer.orders.push(order);
                            
                            processedOrders++;
                            if (processedOrders === orders.length) {
                                processedCustomers++;
                                if (processedCustomers === results.length) {
                                    res.json(results); // Respondemos solo cuando todos los clientes y sus órdenes estén procesados
                                }
                            }
                        });
                    });

                    // Si el cliente no tiene órdenes, procedemos al siguiente cliente
                    if (orders.length === 0) {
                        processedCustomers++;
                        if (processedCustomers === results.length) {
                            res.json(results);
                        }
                    }
                });
            });
        } else {
            res.send('No hay resultados');
        }
    });
});



// Obtener un customer por su número
ruta.get('/customers/:customerNumber', function(req, res) {
    let sql = "SELECT * FROM customers WHERE customerNumber = ?";
    conexion.query(sql, [req.params.customerNumber], (err, rows) => {
        if (err) {
            console.error('Error en la consulta SQL:', err);
            return res.status(500).json({ mensaje: 'Error en el servidor', error: err });
        }
        res.json(rows);
    });
   
});

ruta.get('/customers/:customerNumber/orders', (req, res) => {
    const { customerNumber } = req.params;
    const sqlCustomer = `SELECT * FROM customers WHERE customerNumber = ${customerNumber}`;
    
    conexion.query(sqlCustomer, (error, result) => {
        if (error) throw error;
        if (result.length > 0) {
            const sqlOrders = `SELECT orderNumber, 
                                      DATE_FORMAT(orderDate, '%d-%m-%Y') as orderDate, 
                                      status 
                               FROM orders 
                               WHERE customerNumber = ${customerNumber}`;
            
            conexion.query(sqlOrders, (error, orders) => {
                if (error) throw error;
                
                let processedOrders = 0;
                result[0].orders = [];

                orders.forEach(order => {
                    const sqlTotal = `SELECT SUM(quantityOrdered * priceEach) AS total 
                                      FROM orderdetails 
                                      WHERE orderNumber = ${order.orderNumber}`;
                    
                    conexion.query(sqlTotal, (error, totalResults) => {
                        if (error) throw error;
                        
                        order.total = parseFloat(totalResults[0].total).toFixed(2); // Agregar el total a cada orden
                        result[0].orders.push(order);

                        processedOrders++;
                        if (processedOrders === orders.length) {
                            res.json(result); // Respondemos cuando todas las órdenes han sido procesadas
                        }
                    });
                });

                if (orders.length === 0) {
                    res.json(result); // Si no hay órdenes
                }
            });
        } else {
            res.send('No hay resultados');
        }
    });
});


// Eliminar un customer por su número
ruta.delete('/customers/:customerNumber', function(req, res) {
    let sql = "DELETE FROM customers WHERE customerNumber = ?";
    conexion.query(sql, [req.params.customerNumber], (err, result) => {
        if (err) {
            console.error('Error en la consulta SQL:', err);
            return res.status(500).json({ mensaje: 'Error en el servidor', error: err });
        }
        res.json({ mensaje: 'Registro Eliminado' });
    });
});

// Crear un nuevo customer
ruta.post('/customers', function(req, res) {
    const poststr = {
        customerName: req.body.customerName,
        contactLastName: req.body.contactLastName,
        contactFirstName: req.body.contactFirstName,
        phone: req.body.phone,
        addressLine1: req.body.addressLine1,
        addressLine2: req.body.addressLine2,
        city: req.body.city,
        state: req.body.state,
        postalCode: req.body.postalCode,
        country: req.body.country,
        salesRepEmployeeNumber: req.body.salesRepEmployeeNumber,
        creditLimit: req.body.creditLimit
    };
    let sql = "INSERT INTO customers SET ?";
    conexion.query(sql, poststr, function (err, result) {
        if (err) {
            console.error('Error en la inserción SQL:', err);
            return res.status(500).json({ mensaje: 'Error en el servidor', error: err });
        }
        res.status(201).json({ mensaje: 'Registro guardado', codigo: 1 });
    });
});

// Actualizar un customer existente
ruta.put('/customers', function(req, res) {
    let sql = "UPDATE customers SET customerName=?, contactLastName=?, contactFirstName=?, phone=?, addressLine1=?, addressLine2=?, city=?, state=?, postalCode=?, country=?, salesRepEmployeeNumber=?, creditLimit=? WHERE customerNumber=?";
    conexion.query(sql, [
        req.body.customerName,
        req.body.contactLastName,
        req.body.contactFirstName,
        req.body.phone,
        req.body.addressLine1,
        req.body.addressLine2,
        req.body.city,
        req.body.state,
        req.body.postalCode,
        req.body.country,
        req.body.salesRepEmployeeNumber,
        req.body.creditLimit,
        req.body.customerNumber
    ], function (err, result) {
        if (err) {
            console.error('Error en la actualización SQL:', err);
            return res.status(500).json({ mensaje: 'Error en el servidor', error: err });
        }
        res.json({ mensaje: 'Registro actualizado', codigo: 1 });
    });
});

module.exports = ruta;