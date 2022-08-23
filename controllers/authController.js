const User = require("../models/User");
const {validationResult} = require('express-validator');
const {uid} = require('uid');
const nodemailer = require('nodemailer');
require('dotenv').config()

const registerForm = (req, res) => {
    res.render('register');
};

const loginForm = (req, res) => {
    res.render('login');
};

const registerUser = async (req, res) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        req.flash('mensajes', errors.array())
        return res.redirect('/auth/register')
    }

    const {userName, email, password} = req.body;
    
    try {

        let user = await User.findOne({email});
        if(user) throw new Error('Ya existe el usuario')

        user = new User({userName, email, password, tokenConfirm: uid()})
        await user.save()

        const transport = nodemailer.createTransport({
            host: "smtp.mailtrap.io",
            port: 2525,
            auth: {
              user: process.env.USEREMAIL,
              pass: process.env.PASSEMAIL
            }
          });

          await transport.sendMail({
            from: '"Fred Foo " <foo@example.com>',
            to: user.email,
            subject: 'Verifica tu cuenta de correo',
            html: `<a href="${process.env.PATHHEROKU || 'http://localhost:5600/'}auth/confirmar/${user.tokenConfirm}">Verificar mi cuenta</a>`,
          });

        req.flash('mensajes', [{msg: 'Revisa tu correo electrónico y válida tu cuenta'}])
        return res.redirect('/auth/login');
        // res.render('login');
        // res.json(user)

    } catch (error) {

        req.flash('mensajes', [{msg: error.message}])
        return res.redirect('/auth/register')
        // res.json({error: error.message})
    
    }
};

const confirmarCuenta = async (req, res) => {
    const {token} = req.params;

    try {
        const user = await User.findOne({tokenConfirm: token});
        if(!user) throw new Error('No existe este usuario');

        user.cuentaConfirmada = true;
        user.tokenConfirm = null;

        await user.save();

        req.flash('mensajes', [{msg: 'Cuenta verificada ya puedes iniciar sesión'}])
        res.redirect('/auth/login');
        // res.render('login');
    } catch (error) {
        req.flash('mensajes', [{msg: error.message}])
        return res.redirect('/auth/login')
        // res.json({error: error.message});
    }

};


const loginUser = async (req, res) => {

    const errors = validationResult(req)
    
    if(!errors.isEmpty()){
        req.flash('mensajes', errors.array())
        return res.redirect('/auth/login')
    }

    const {email, password} = req.body;

    try {

        const user = await User.findOne({email});
        if(!user) throw new Error('No existe este email');

        if(!user.cuentaConfirmada) throw new Error('Falta confirmar cuenta');

        if(!(await user.comparePassword(password))) throw new Error('La contraseña no es correcta');

        //me esta creando la sesion de usuario a traves de passport
        req.login(user, function(err){
            if(err){
                throw new Error('Error al crear la sesión')
            } else{      
                return res.redirect('/');
            }
        })

    } catch (error) {
        // console.log(error);
        req.flash('mensajes', [{msg: error.message}])
        return res.redirect('/auth/login')
        // return res.send(error.message);
    }
};

const cerrarSesion = (req, res) => {
    req.logout(function(err){
        if(err){
            return next(err)
        }
        return res.redirect('/auth/login')
    })
}

module.exports = {
    loginForm,
    registerForm,
    registerUser,
    confirmarCuenta,
    loginUser,
    cerrarSesion
}