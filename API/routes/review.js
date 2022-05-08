const express = require('express');
const Redis = require('redis');

const router = express.Router();
const db = new Redis();

/*
owner, shop,
*/

router.post('/', async (req, res, next) => {
    try {
        const review = await db.reviews.set(req.body.owner, req.body.shop);
        if(await db.users.addReview(owner, review.id) && await db.shops.addReview(shop, review.id)) {
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