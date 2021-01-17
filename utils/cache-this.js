const cacheThis = (asyncFn, minRefresh = 20) => {
    const cache = {};
    return async (...args) => {
        const strArgs = JSON.stringify(args);
        if (cache[strArgs]) {
            const { timestamp, value } = cache[strArgs];
            const now = Date.now();
            const msDiff = now - timestamp;
            const secDiff = msDiff / 1000;
            const minDiff = secDiff / 60;
            if (minDiff > minRefresh) {
                console.log('time to refresh cache', minDiff, 'minutes since last refresh', strArgs);
            } else {
                console.log('getting from cache', strArgs);
                return value;
            }
        }
        const value = await asyncFn(...args);
        cache[strArgs] = {
            timestamp: Date.now(),
            value
        };
        return value;
    };
};

module.exports = cacheThis;