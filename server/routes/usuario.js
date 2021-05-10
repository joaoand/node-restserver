const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const Usuario = require('../models/usuario')
const app = express();
app.get('/usuario', function(req, res) {
    let desde = req.query.desde || 0; // Este valor se obtiene de la url esta acompañado de ?nombre=valor
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    // Segundo argumento de find se realiza una selección de lo que nos interesa mandar. 
    Usuario.find({ estado: true }, 'nombre email role estado google img') //si los corcherte estan vacios se envia toda la base de datos
        .skip(desde) //se salta los primeros 5 registros
        .limit(limite) //limite de registros que se envia
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            // .count necesario para saber la cantidad de registros que cumplen la condición 
            Usuario.count({ estado: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo
                });

            })


        })

});
//sirve para ingresar inforamción a la base de datos a partir informacion que se envia
app.post('/usuario', function(req, res) {

    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err: err
            });
        };

        //usuarioDB.password = null;

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });

    //ESto es lo que estaba antes de definir la base de datos
    // if (body.nombre === undefined) {
    //     res.status(400).json({
    //         ok: false,
    //         mensaje: 'El nombre es necesario'
    //     });
    // } else {
    //     res.json({
    //         persona: body
    //     });
    // };


});
//Sirve para actualizar un registro 
app.put('/usuario/:id', function(req, res) {
    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);



    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        };

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    })


});

app.delete('/usuario/:id', function(req, res) {

    let id = req.params.id; // es el id del url 
    //Esto ya no se suele hacer así porque no nos interesa quitar el registro de la base de datos, sino cambiar su estado de activo a desactivado. =====>
    // Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
    //     if (err) {
    //         return res.status(400).json({
    //             ok: false,
    //             err
    //         });
    //     };

    //     if (usuarioBorrado === null) {

    //         return res.status(400).json({
    //             ok: false,
    //             err: {
    //                 message: 'Usuario no encontrado'
    //             }
    //         });
    //     }

    //     res.json({
    //         ok: true,
    //         usuario: usuarioBorrado
    //     });
    // })

    let cambiaEstado = {
        estado: false
    }

    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioBorrado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        };

        res.json({
            ok: true,
            usuario: usuarioBorrado
        });
    });


});

module.exports = app;