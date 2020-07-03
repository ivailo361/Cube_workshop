const MongoDB = require("./mongoTest");

const db = new MongoDB();

db.insertData({
    "name": "ivo2",
    "url": "https://www.tomvanderzanden.nl/thumb.php?f=Li9wdXp6bGVzL0hlbGljb3B0ZXIgU2tld2IvcGljMS5qcGc=&s=1200&h=68150c32f0166cc8e47266cc62920c4b",
    "description": "A nice cube TWO",
    "level": "4"
})