
/*
id NOT NULL UNIQUE
tags <-- 관계로 정의
owner NOT NULL UNIQUE USER.id
shop NOT NULL UNIQUE SHOP.id

*/

module.exports = class Review {
    constructor(owner, shop, id) {
        this.owner = owner;
        this.shop = shop;
        this.id = id;
    }
};