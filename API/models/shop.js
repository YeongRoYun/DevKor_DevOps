/*
id NOT NULl UNIQUE
name NOT NULL UNIQUE
location NOT NULL UNIQUE <-- 가게와 밀접한 연관, 여러 지점이 있는 경우를 고려해서 set으로 구현하자
review <-- 관계로 정의
user <-- 관계로 정의

*/

module.exports = class Shop {
    constructor(owner, name, location, id) {
        this.owner = owner;
        this.name = name;
        this.location = location;
        this.id = id;
    }
};