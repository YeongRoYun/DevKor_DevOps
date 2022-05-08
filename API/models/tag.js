
/*
id NOT NULl UNIQUE
name NOT NULL UNIQUE
reviews NULL <- 관계로 정의
*/

module.exports = class Tag {
    constructor(name, id) {
        this.name = name;
        this.id = id;
    }
};