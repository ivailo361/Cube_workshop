const uniqid = require('uniqid');

class Cube {
    constructor(name, url, description, level) {
        this.id = uniqid();
        this.name = name;
        this.url = url || "https://secure.img1-fg.wfcdn.com/im/79891591/compr-r85/1902/1902870/stainless-steel-cube-end-table.jpg";
        this.description = description;
        this.level = level;
    }
}

module.exports = Cube