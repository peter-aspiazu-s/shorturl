const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    const urls = [
        {origin: "www.google.com/bluuweb1", shortURL: "shdshh1"},
        {origin: "www.google.com/bluuweb2", shortURL: "shdshh2"},
        {origin: "www.google.com/bluuweb3", shortURL: "shdshh3"},
    ]

    res.render('home', {urls});
});


module.exports = router