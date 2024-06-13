const express = require('express')
const app = express()
const { MongoClient, ServerApiVersion } = require('mongodb');
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
    
    app.post('/books',async(req,res)=>{
      const books={
        Name:'Harry Potter',
        Price:400
      };
      const result=await booksCollection.insertOne(books);
      res.send(result)
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