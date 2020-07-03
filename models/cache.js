
module.exports = function cache(fn) {
    let store = [];
 
    return async function (insertedId) {
        console.log(this.main)
        if (insertedId !== undefined || store.length === 0) {
            store = await fn()
            console.log("ivo")
            console.log('inside IF')
        }
        return store        
    };
}