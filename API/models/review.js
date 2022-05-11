
/*
id NOT NULL UNIQUE
tags <-- 관계로 정의
owner NOT NULL UNIQUE USER.id
shop NOT NULL UNIQUE SHOP.id

1: n 관계는 model에 관계를 넣자
*/

module.exports = class Review {
    constructor(owner, shop, id) {
        this.owner = owner;
        this.shop = shop;
        this.id = id;
    }
};