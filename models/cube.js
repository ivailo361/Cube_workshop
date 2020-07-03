const uniqid = require('uniqid');

class Cube {
    name;
    description;
    url;

    constructor(name, description, url, level) {
        this._name = name;
        this._description = description;
        this._url = url
        this.level = level;
    }

    get _url() {
        return this.url
    }

    set _url(value) {
        console.log(value)
        if (value === "") {
            this.url = "https://secure.img1-fg.wfcdn.com/im/79891591/compr-r85/1902/1902870/stainless-steel-cube-end-table.jpg"
 
        }
        else if (!value.match(/^https?:\/\//)) {
            throw new Error("The URL should starts with http or https")
        }
        else {
            this.url = value
        }
    }

    get _name() {
        return  this.name
    }
    set _name(value) {
        if (value.length === 0) {
            throw new Error("The name should not be empty")
        }
        this.name = value
    }

    get _description() {
        return  this.name
    }
    set _description(value) {
        if (value.length <= 5) {
            throw new Error("The description should be more than 5 symbols")
        }
        this.description = value
    }
}

class Accessory {
    name;
    description;
    url;
    constructor(name, description, url) {
        this._name = name;
        this._url = url;
        this._description = description;
    }

    get _url() {
        return this.url
    }

    set _url(value) {
        console.log(value)
        if (value === "") {
            this.url = "https://www.inspire-lighting.com/vendors/7480/large/3138-411.jpg"
        }
        else if (!value.match(/^https?:\/\//)) {
            throw new Error("The URL should starts with http or https")
        }
        else {
            this.url = value
        }
    }

    get _name() {
        return  this.name
    }
    set _name(value) {
        if (value.length === 0) {
            throw new Error("The name should not be empty")
        }
        this.name = value
    }

    get _description() {
        return  this.name
    }
    set _description(value) {
        if (value.length <= 5) {
            throw new Error("The description should be more than 5 symbols")
        }
        this.description = value
    }
}

module.exports = {
    Cube,
    Accessory
}