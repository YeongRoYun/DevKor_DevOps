const redis = require('./models/redis');

const db = new redis();

const test = async () => {
    const x = await db.tags.set('test', 'eval');
    console.log(x);
};

test();