/*
id NOT NULL UNIQUE
name NOT NULL UNIQUE
shop: NULL , 관계로 정의

*/

module.exports = class Type {
    constructor(name, id) {
        this.name = name;
        this.id = id;
    }
};