const express = require('express');
const Redis = require('../models/redis');

const router = express.Router();
const db = new Redis();
/*
req: {
    name,
    type,
}
*/
router.post('/', async (req, res, next) => {
    try{
        const user = await db.users.set();
        res.status(201).header({
            'Link': {
                'mainPage': '/',
                'userInfo': `/users/${user.id}/`,
            },
        })
        .json({
            status: 201,
            payload: user,
        })
        .redirect('/');
    } catch(err) {
        next(err);
    }
});

module.exports = router;