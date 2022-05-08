const redis = require('redis');
const conf = require('./redis-config');
const {Tag, User, Shop, Type, Review} = require('./');
/*
객체를 돌려받아야 하면 ERROR를 던지고,
true/false로 조건만 따지면 boolean을 반환한다
*/

module.exports = class {
    constructor() {
        this._setRedis();

        this.users = new this.Users(this);
        this.types = new this.Types(this);
        this.tags = new this.Tags(this);
        this.shops = new this.Shops(this);
        this.reviews = new this.Reviews(this);
    };
  
    _setRedis() {
      this._setRedisClient();
      this.client.on('end', this._endHandler);
      this.client.on('ready', this._readyHandler);
      this.client.on('error', this._errorHandler);
      this.client.on('connect', this._connectHandler);
      this.client.on('reconnecting', this._reconnectHandler);
    };
    
    _endHandler() {
        console.log('Redis end');
    };
    _readyHandler() {
        console.log('Redis ready');
    };
    _errorHandler(err) {
        console.error('Redis error', err);
    };
    _connectHandler() {
        console.log('Redis connection');
    };
    _reconnectHandler() {
        console.log('Redis reconnection');
    };
    async _setRedisClient() {
      this.client = redis.createClient(`redis://${conf.user}:${conf.password}@${conf.host}:${conf.port}`);
      await this.client.connect();
    };
    quit(callback) {
        this.client.quit(callback);
    };
    getKey(db, id) { return `${db}:${id}`;};

    Users = class {
        constructor(parent) {
            this.parent = parent;
        };
        async exist(id) {
            const key = this.parent.getKey('users', id);
            const ret = await this.parent.client.exists(key, (err) => console.error('ERROR: USER EXIST'));
            return (ret !== 0) ? true : false;
        };
        async set(name, type) {
            const id = await this.parent.client.incr('userId', (err)=>console.error('ERROR: USER SET'));
            const key = this.parent.getKey('users', id);
            const ret = await this.parent.client.sendCommand(['HMSET', key, 'name', name, 'type', type], (err) => console.error('ERROR: USER SET'));
            if(ret === 'OK') {
                return new User(name, type, id);
            } else {
                const error = new Error(`ERROR: USER SET`);
                error.status = 404;
                throw error;
            }
        };
        async get(id) {
            const key = this.parent.getKey('users', id);
            const ret = await this.parent.client.hGetAll(key, (err) => console.error('ERROR: USER GET'));
            if(ret.name !== undefined) {
                return new User(ret.name, ret.type, id);
            } else {
                const error = new Error(`ERROR: USER EXIST`);
                error.status = 404;
                throw error;
            }
        };
        async update(id, newName, newType) {
            const key = this.getKey('users', id);
            if(await this.exist(id)) {
                const ret = await this.parent.client.sendCommand(['HMSET', key, 'name', newName, 'type', newType], (err) => console.error('ERROR: USER UPDATE'));
                return (ret === 'OK') ? true : false;
            } else {
                return false;
            }
        };
        async delete(id) {
            const key = this.parent.getKey('users', id);
            const ret = await this.parent.client.del(key, (err) => console.error('ERROR: USER DELETE'));
            return (ret !== 0) ? true : false;
        };
        async addShop(userId, shopId) {
            const key = `users:${userId}:shops`;
            if(await this.exist(userId)) {
                const ret = await this.parent.client.sendCommand(['SADD', key, shopId], (err) => console.error('ERROR: USER ADDSHOP'));
                return (ret !== 0) ? true : false;
            } else {
                return false;
            }
        }
    };
    Types = class {
        constructor(parent) {
            this.parent = parent;
            this.keys = 'types';
        };
        async exist(id) {
            const ret = await this.parent.client.zScore(this.key, id, (err) => console.error('ERROR: TYPE EXIST'));
            return (ret !== 0) ? true : false;
        };
        async set(name) {
            const id = await this.parent.client.incr('typeId', (err)=>console.error('ERROR: TYPE SET'));
            const ret = await this.parent.client.sendCommand(['ZADD', this.key, id, name], console.error('ERROR: TYPE SET'));
            if(ret !== 0) {
                return new Type(name, id);
            } else {
                const error = new Error(`ERROR: TYPE SET`);
                error.status = 404;
                throw error;
            }
        };
        async get(id) {
            const ret = await this.parent.client.zRangeByScore(this.key, id, id, (err) => console.error('ERROR: TYPE GET'));
            if(ret.length !== 0) {
                return new Type(ret[0], ret[1]);
            } else {
                const error = new Error(`ERROR: TYPE EXIST`);
                error.status = 404;
                throw error;
            }
        };
        async update(id, newName) {
            if(this.exist(id)) {
                await this.delete(id);
                const ret = await this.parent.client.sendCommand(['ZADD', this.key, id, newName], (err) => console.error('ERROR: TYPE UPDATE'));
                return (ret !== 0) ? true : false;
            } else {
                return false;
            }
        };
        async delete(id) {
            const val = await this.get(id);
            const ret = await this.parent.client.zRem(this.key, val[0], (err) => console.error('ERROR: TYPE DELETE'));
            return (ret !== 0) ? true : false;
        };
    };
    Tags = class {
        constructor(parent) {
            this.parent = parent;
            this.key = 'tags';
        };
        async exist(id) {
            const ret = await this.parent.client.zScore(this.key, id, (err) => console.error('ERROR: TAG EXIST'));
            return (ret !== 0) ? true : false;
        };
        async set(name) {
            const id = await this.parent.client.incr('tagId', (err)=>console.error('ERROR: TAG SET'));
            const ret = await this.parent.client.sendCommand(['ZADD', this.key, id, name], console.error('ERROR: TAG SET'));
            if(ret !== 0) {
                return new Tag(name, id);
            } else {
                const error = new Error(`ERROR: TAG SET`);
                error.status = 404;
                throw error;
            }
        };
        async get(id) {
            const ret = await this.parent.client.zRangeByScore(this.key, id, id, (err) => console.error('ERROR: TAG GET'));
            if(ret.length !== 0) {
                return new Tag(ret[0], ret[1]);
            } else {
                const error = new Error(`ERROR: TAG EXIST`);
                error.status = 404;
                throw error;
            }
        };
        async update(id, newName) {
            if(this.exist(id)) {
                await this.delete(id);
                const ret = await this.parent.client.sendCommand(['ZADD', this.key, id, newName], (err) => console.error('ERROR: TAG UPDATE'));
                return (ret !== 0) ? true : false;
            } else {
                return false;
            }
        };
        async delete(id) {
            const val = await this.get(id);
            const ret = await this.parent.client.zRem(this.key, val[0], (err) => console.error('ERROR: TAG DELETE'));
            return (ret !== 0) ? true : false;
        };   
    };
    Shops = class {
        constructor(parent) {
            this.parent = parent;
        }
        async exist(id) {
            const key = this.parent.getKey('shops', id);
            const ret = await this.parent.client.exists(key, (err) => console.error('ERROR: SHOP EXIST'));
            return (ret !== 0) ? true : false;
        };
        async set(owner, name, location) {
            const id = await this.parent.client.incr('shopId', (err)=>console.error('ERROR: SHOP SET'));
            const key = this.parent.getKey('shops', id);
            const ret = await this.parent.client.sendCommand(['HMSET', key, 'name', name, 'location', location], (err) => console.error('ERROR: SHOP SET'));
            if(ret === 'OK') {
                return new Shop(owner, name, location, id);
            } else {
                const error = new Error(`ERROR: SHOP SET`);
                error.status = 404;
                throw error;
            }
        };
        async get(id) {
            const key = this.parent.getKey('shops', id);
            const ret = await this.parent.client.hGetAll(key, (err) => console.error('ERROR: SHOP GET'));
            if(ret.name !== undefined) {
                return new Shop(ret.owner, ret.name, ret.location, id);
            } else {
                const error = new Error(`ERROR: SHOP EXIST`);
                error.status = 404;
                throw error;
            }
        };
        async update(id, newName, newLocation) {
            const key = this.parent.getKey('shops', id);
            if(await this.exist(id)) {
                const ret = await this.parent.client.sendCommand(['HMSET', key, 'name', newName, 'location', newLocation], (err) => console.error('ERROR: SHOP UPDATE'));
                return (ret !== 0) ? true : false;
            } else {
                return false;
            }
        };
        async delete(id) {
            const key = this.parent.getKey('shops', id);
            const ret = await this.parent.client.del(key, (err) => console.error('ERROR: SHOP DELETE'));
            return (ret !== 0) ? true : false;
        };
    };
    Reviews = class {
        constructor(parent) {
            this.parent = parent;
        }
        async exist(id) {
            const key = this.parent.getKey('reviews', id);
            const ret = await this.parent.client.exists(key, (err) => console.error('ERROR: REVIEW EXIST'));
            return (ret !== 0) ? true : false;
        };
        async set(owner, shop) {
            const id = await this.parent.client.incr('reviewId', (err)=>console.error('ERROR: REVIEW SET'));
            const key = this.parent.getKey('reviews', id);
            const ret = await this.parent.client.sendCommand(['HMSET', key, 'owner', owner, 'shop', shop], (err) => console.error('ERROR: REVIEW SET'));
            if(ret === 'OK') {
                return new Review(owner, shop, id);
            } else {
                const error = new Error(`ERROR: REVIEW SET`);
                error.status = 404;
                throw error;
            }
        };
        async get(id) {
            const key = this.parent.getKey('reviews', id);
            const ret = await this.parent.client.hGetAll(key, (err) => console.error('ERROR: REVIEW GET'));
            if(ret.owner !== undefined) {
                return new Review(ret.owner, ret.shop, id);
            } else {
                const error = new Error(`ERROR: REVIEW EXIST`);
                error.status = 404;
                throw error;
            }
        };
        //tag들이 변하는 것
        async update(id, tags) {
            const key = `reviews:${id}:tags`
            if(await this.exist(id)) {
                const ret = await this.parent.client.sendCommand(['SADD', key].concat(tags), (err) => console.error('ERROR: REVIEW UPDATE'));
                return (ret !== 0) ? true : false;
            } else {
                return false;
            }
        };
        async delete(id) {
            const key = this.parent.getKey('reviews', id);
            const ret = await this.parent.client.del(key, (err) => console.error('ERROR: REVIEW DELETE'));
            return (ret !== 0) ? true : false;
        };
    };
};