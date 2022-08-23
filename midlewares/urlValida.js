const {URL} = require("url");

const urlValidar = (req, res, next) => {
    try {
        const {origin} = req.body;
        const urlFrontend = new URL(origin);
        if(urlFrontend.origin !== "null"){
            if (
                urlFrontend.protocol === 'http:' ||
                urlFrontend.protocol === 'https:'
            ) {
                return next();
            }
            throw new Error('tiene que tener http:// o https://')
        }
        throw new Error("url no válida");

    } catch (error) {
        if(error.message === 'Invalid URL'){
            req.flash('mensajes', [{msg: 'url no válida'}])
        }else {
            req.flash('mensajes', [{msg: error.message}])
        }
        return res.redirect('/')
    }
}

module.exports = urlValidar;