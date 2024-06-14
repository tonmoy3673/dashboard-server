const express = require('express')
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const stripe = require('stripe')(process.env.STRIPE_KEY);
const port = 5000;
const cors=require('cors')
require("dotenv").config();
app.use(express.json())
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.kcaxujv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
  try {
   
    await client.connect();

    const booksData=client.db('booksData')
    const booksCollection=booksData.collection('booksCollection')
    const paymentsCollection=booksData.collection('paymentsCollection');
    
    // ========= Add Products =========//
    app.post('/books',async(req,res)=>{
      const books=req.body
      const result=await booksCollection.insertOne(books);
      res.send(result)
    })

    app.get('/books',async(req,res)=>{
      const books= await booksCollection.find({}).toArray();
      res.send(books)
    })

    app.get('/books/:id',async(req,res)=>{
      const id=req.params.id;
      const query={_id: new ObjectId(id)};
      const book=await booksCollection.findOne(query);
      res.send(book)
    })

    // =========== Delete Method ============//
    app.delete('/books/:id',async(req,res)=>{
      const id= req.params.id;
      const result= await booksCollection.deleteOne({_id: new ObjectId(id)});
      res.send(result);
    });

    // =========== Update Method ==============//
    app.patch('/books/:id',async(req,res)=>{
      const id=req.params.id;
      const updatedData=req.body;
      const result= await booksCollection.updateOne(
        {_id: new ObjectId(id)},
        {$set:updatedData}
      )
      res.send(result)
    })

    // ============ payment section =======//

    app.post('/create-payment-intent', async (req, res) => {
      const booking = req.body;
      const price = booking.price;
      const amount = price * 100;
      const paymentIntent = await stripe.paymentIntents.create({
          currency: 'usd',
          amount: amount,
          "payment_method_types": [
              "card"
          ]
      });
      res.send({
          clientSecret: paymentIntent.client_secret,
      });

  });

  app.post('/payments', async (req, res) => {
    const payment = req.body;
    const result = await paymentsCollection.insertOne(payment);
    const id = payment.bookingId
    const filter = { _id: ObjectId(id) }
    const updatedDoc = {
        $set: {
            paid: true,
            transactionId: payment.transactionId
        }
    }
    const updatedResult = await booksCollection.updateOne(filter, updatedDoc)
    res.send(result);
})

   
    console.log("Connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
   
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Server Connected!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})