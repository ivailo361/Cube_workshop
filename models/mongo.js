const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];

const { MongoClient } = require('mongodb');
var ObjectId = require('mongodb').ObjectId;
const assert = require('assert');

// const db_user = process.env.db_user || "";
// const db_pass = process.env.db_pass || "";
// $env:db_user="koko" write down in the consol before start node file invocation

const uri = `mongodb+srv://${config.db_user}:${config.db_pass}@cluster0-zpn4z.mongodb.net?retryWrites=true&w=majority`
// const uri = `mongodb+srv://koko:<password>@cluster0-zpn4z.mongodb.net/<dbname>?retryWrites=true&w=majority`
const databaseName = "cube";
// const collectionName = "cubesList"


class MongoDB {
    constructor() {
        this.client;
    }

    async main() {

        try {
            this.client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
            await this.client.connect();
            return this.client.db(config.db_name)

        } catch (e) {
            console.error(e);
        }
        // finally {
        //     await client.close();
        // }
    }

    async dataValidation(db) {
        const result = await db.createCollection("cubeList", {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["name"],
                    properties: {
                        name: {
                            bsonType: "string",
                            description: "must be a string and is required"
                        },
                        url: {
                            bsonType: "string",
                            pattern: "^https?:\/\/",
                            description: "must be a string and match the regular expression pattern"
                        },
                        description: {
                            bsonType: "string",
                            description: "must be a text"
                        },
                        level: {
                            bsonType: "int",
                            description: "must be a number"
                        }
                    }
                }
            },
            // validationLevel: "moderate",
            // validationAction: "warn"
        })
        console.log(result.writeConcerns)
    };

    async getData(collectionName, cubeId) {
        const db = await this.main();
        let param = cubeId ? { _id: new ObjectId(cubeId) } : ""
        const cursor = db.collection(collectionName).find(param);
        const results = await cursor.toArray();
        if (results.length > 0) {
            return results;
        } 
        // else if (results.length === 1){
        //     return results
        // } 
        else {
            console.log(`No listings found `);
        }
    }
    async addAccessories(cubesDb, accessDb, cubeId, accessoryId) {
        const db = await this.main();
        const cube_id = new ObjectId(cubeId);

        if (!accessoryId) throw new Error("no more accessories")

        const accessory_Id = new ObjectId(accessoryId);
        const resultCube = await db.collection(cubesDb).updateOne(
            { "_id": cube_id },
            {
                $push: { accessories: accessory_Id }
            }
        );
        const resultAccessories = await db.collection(accessDb).updateOne(
            { "_id": accessory_Id },
            {
                $push: { cubes: cube_id }
            }
        );

        return resultCube
        // `Modified records in ${cubesDb}: ${resultCube.modifiedCount} and ${accessDb}: ${resultAccessories.modifiedCount}`
    }

    async deleteOneCube(collectionName, id) {
        const db = await this.main();
        const o_id = new ObjectId(id);
        const result = await db.collection(collectionName).deleteOne({ "_id": o_id });
        return result
    }

    async removeIdFromArray(collectionName, cubeId, accessId) {
        const db = await this.main();
        const o_cubeId = new ObjectId(cubeId);
        const o_accessId = new ObjectId(accessId);
        if (collectionName === 'cubesList') {
            const result = await db.collection(collectionName)
                .updateOne({ "_id": o_cubeId }, { $pull: { accessories: o_accessId } });
            return result
        }
        else if (collectionName === 'accessories') {
            const result = await db.collection(collectionName)
                .updateOne({ "_id": o_accessId }, { $pull: { cubes: o_cubeId } });
            return result
        }
    }

    async extractCubesFromAccessories(collectionName, cubeId, missing) {
        const db = await this.main();
        const o_cubeId = new ObjectId(cubeId);
        let param;
        if (missing) {
            param = { cubes: { '$ne': o_cubeId } }
        } else {
            param = { cubes: { '$eq': o_cubeId } }
        }
        const cursor = db.collection(collectionName).find(param);
        let result = await cursor.toArray();

        if (result.length === 0) result = false

        return result
    }


    async insertData(collectionName, record) {
        const db = await this.main();
        try {
            const result = await db.collection(collectionName).insertOne(record);
            // console.log(`New listing created with the following id: ${result.insertedId}`);
            return result.insertedId;
        } catch (e) {
            console.error(e);
        }
        finally {
            await this.client.close();
        }
    }
}

module.exports = MongoDB;



