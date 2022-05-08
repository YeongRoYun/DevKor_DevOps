/*
User {
    id를 따로 저장! (set userid = 1 incr)
    id NOT NULL UNIQUE
    name NOT NULL
    type NOT NULL { consumer, producer }
    reviews NULL // review db에서 user id로
    shop: // shop db에서 user id로
}
*/
module.exports = class User {
    constructor(name, type, id) {
        this.name = name;
        this.type = type;
        this.id = id;
    }
};

