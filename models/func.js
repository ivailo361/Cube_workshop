// const { Cube, Accessory } = require("./cube")
// const MongoDB = require("./mongo");
const bcrypt = require('bcrypt');
// const db = new MongoDB();


// async function getData(collectionName) {
//     let data = await db.getData(collectionName)
//     return data
// }

let validation = {
    // dbUser: (userName, _) => {
    //     if (userName === null) {
    //         throw new Error('The user does not exist')
    //     } else {
    //         return userName;
    //     }
    // },
    // dbUserPass: async (dbUserPass, fullData) => {
    //     let isPasswordsMatch = await bcrypt.compare(fullData.formPass, dbUserPass)
    //     if (!isPasswordsMatch) {
    //         throw new Error('Wrong password please try again')
    //     }
    //     else {
    //         return isPasswordsMatch;
    //     }
    // },
    name: (ime, _) => {
        if (ime.length === 0) {
            throw new Error("The name should not be empty")
        } else {
            return ime;
        }
    },
    username: (username, _) => {
        if (username.length < 3) {
            throw new Error('User name must be at least 3 char long')
        } else {
            return username;
        }
    },
    password: (password, _) => {
        if (password.length < 4) {
            throw new Error('Password must be 4 or more symbols')
        } else {
            return password
        }
    },
    repeatPassword: (repeatPassword, fullData) => {
        if (repeatPassword !== fullData.password) {
            throw new Error('Repeat password does not match password')
        } else {
            return repeatPassword
        }
    },
    description: (des, _) => {
        if (des.length <= 5) {
            throw new Error("The description should be more than 5 symbols")
        } else {
            return des
        }
    },
    url: (link, _) => {
        if (link === "") {
            return "https://secure.img1-fg.wfcdn.com/im/79891591/compr-r85/1902/1902870/stainless-steel-cube-end-table.jpg"
        }
        else if (!link.match(/^https?:\/\//)) {
            throw new Error("The URL should starts with http or https")
        }
        else {
            return link
        }
    }

}

function messages(keyWord, param) {
    let obj = {
        success: `You successfully added accessory to cube name ${param}`,
        deletedAccessories: `Accessory was successfully deleted form cube ${param}`,
        update: `A cube name ${param} was updated`,
        deleteCube: `Cube ${param} was successfully deleted`
    }

    return obj[keyWord]
}


function validateInput(inputData) {
    let obj = Object.keys(inputData)
        .reduce((acc, b) => {
            if (acc[b]) {
                throw new Error("There are duplicated bs")
            }
            if (typeof (validation[b]) === "function") {
                let valid = validation[b](inputData[b], inputData)
                acc[b] = valid
            } else {
                acc[b] = inputData[b]
            }
            return acc
        }, {})
    return obj
}


function searchCube(database, inputData) {
    let search = new RegExp(inputData.search, 'i')
    console.log(inputData)
    let selected = database
        .filter(x => {
            let isNameExist = x.name.match(search);
            let isLevelHigherFrom = Number(x.level) >= Number(inputData.from);
            let isLevelLowerTo = (inputData.to === '' || Number(x.level) <= Number(inputData.to))
            if (isNameExist && isLevelHigherFrom && isLevelLowerTo) return x
        })

    let obj = {}
    obj.links = selected
    obj.params = inputData

    return obj
}

module.exports = {
    validateInput,
    searchCube,
    messages
}