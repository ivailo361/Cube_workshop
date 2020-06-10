const express = require('express');
const fs = require('fs')
const path = require('path')

function getData(filename) {
    let filePath = path.normalize(
        path.join(__dirname, filename)
    );
    let data = fs.readFileSync(filePath)
    return JSON.parse(data)
}

module.exports = {
    getData
}