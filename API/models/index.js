const Tag = require('./tag');
const User = require('./user');
const Shop = require('./shop');
const Type = require('./type');
const Review = require('./review');

const db = {Tag, User, Shop, Type, Review};

module.exports = db;