const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());


const uri = process

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});


async function run() {
  try {
    await client.connect();
    console.log(" Connected to MongoDB!");

    const db = client.db("artify_db");
    const artifyCollection = db.collection("artifys");
     const  favoritesCollection = db.collection('favorites');

    app.get("/artifys", async (req, res) => {
      const result = await artifyCollection.find().toArray();
      res.send(result);
    });


    app.get("/artifys/:id", async (req, res) => {
      const id = req.params.id;
      const result = await artifyCollection.findOne({ _id: new ObjectId(id) });
      res.send({ success: true, result });
    });


    app.post("/artifys", async (req, res) => {
      const data = req.body;
      data.createdAt = new Date();
      const result = await artifyCollection.insertOne(data);
      res.send({ success: true, insertedId: result.insertedId });
    });


    app.get("/latest-artifys", async (req, res) => {
      const result = await artifyCollection
        .find()
        .sort({ createdAt: -1 })
        .limit(6)
        .toArray();
      res.send(result);
    });


    app.get("/explore-artworks", async (req, res) => {
      const result = await artifyCollection
        .find({ visibility: "Public" })
        .toArray();
      res.send(result);
    });


    app.get("/my-artworks", async (req, res) => {
      const email = req.query.email;
      if (!email) return res.status(400).send({ error: "Missing email" });
      const result = await artifyCollection.find({ userEmail: email }).toArray();
      res.send(result);
    });


    app.delete("/artifys/:id", async (req, res) => {
      const id = req.params.id;
      const result = await artifyCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });


    app.put("/artifys/:id", async (req, res) => {
      const id = req.params.id;
      const updated = req.body;
      const result = await artifyCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updated }
      );
      res.send(result);
    });



app.post("/artifys/:id/like", async (req, res) => {
  const id = req.params.id;
  const { email } = req.body;

  if (!email) return res.status(400).send({ error: "Missing user email" });

  const result = await artifyCollection.updateOne(
    { _id: new ObjectId(id), likedBy: { $ne: email } },
    { $inc: { likes: 1 }, $push: { likedBy: email } }
  );
  const updatedArtwork = await artifyCollection.findOne({ _id: new ObjectId(id) });
  res.send({ success: true, artwork: updatedArtwork });
});






    //  Root route
    app.get("/", (req, res) => {
      res.send(" Artify server is running!");
    });

  } catch (err) {
    console.error("Error in run():", err);
  }
}

run().catch(console.dir);

//  Start server
app.listen(port, () => {
  console.log(` Server running on port ${port}`);
});
