const express = require('express');
const Redis = require('../models/redis');

const router = express.Router();
const db = new Redis();

/*
{
    name,
    location,
    owner,
}
*/

router.post('/', async (req, res, next) => {
    try {
        const shop = await db.shops.set(req.body.owner, req.body.name, req.body.location); 
        if(await db.users.addShop(owner, shop.id)) {
            res.status(201).header({
                'Link': {
                    'mainPage': '/',
                    'shopInfo': `/shops/${shop.id}`,
                },
            }).json({
                status: 201,
                payload: shop,
            }).redirect('/');
        } else {
            db.shops.delete(shop.id);
            const error = new Error(`${shop.owner} Aleady has the shop`);
            error.status = 409;
            next(err);
        }
        
    } catch(err) {
        next(err);
    }
});

router.get('/:id', async (req, res, next) => {
    const shop = await db.shops.get(req.params.id);
    res.status(200).header({
        'Link': {
            'mainPage': '/',
            'shopInfo': `/shops/${shop.id}`,
        },
    }).json({
        status: 200,
        payload: shop,
    }).redirect(`/shops/${shop.id}`);
});

module.exports = router;