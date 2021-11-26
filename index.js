const express = require('express')
const app = express()
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ezuap.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

console.log(uri);


async function run() {
    try {
        await client.connect();
        const database = client.db('assignmentDb');
        const ordersCollection = database.collection('orders');
        const productDb = database.collection('products');
        const usersCollection = database.collection('users');
        // console.log('database connected successfully');

        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const cursor = ordersCollection.find(query);
            const orders = await cursor.toArray();
            res.json(orders);
        })
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })


        app.get('/products', async (req, res) => {
            const cursor = productDb.find({});
            const products = await cursor.toArray();
            res.json(products);
        })


        app.post('/products', async (req, res) => {
            const product = req.body;
            // console.log('hit the post api', product);
            const result = await productDb.insertOne(product);
            console.log(result);
            res.json(result)
        })


        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            console.log(result);
            res.json(result)
            // console.log(order);
            // res.json({ message: 'from server' })
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result)
        })

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options)
            res.json(result);
        })

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc)
            res.json(result);
        })

    }
    finally {
        // await client.close();
    }

}


run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('form E-jewellary server')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})