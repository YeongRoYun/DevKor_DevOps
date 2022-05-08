const express = require('express')

const router = express.Router()

router.use((req, res, next) => {
    const error = new Error(`${req.method} ${req.url} NOT FOUND`);
    error.status = 404;
    next(error);
});

router.use((err, req, res, next) => {
    const message = error.message;
    const error = (process.env.NODE_ENV === 'production')? {} : err;
    res.status(err.status || 500);

    res.render('error', {message, error});
});

module.exports = router;