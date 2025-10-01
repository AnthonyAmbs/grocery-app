import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

const ItemSchema = new mongoose.Schema({
    name : {type: String, required: true },
    category: String,
    quantity: Number,
    price: Number
});
const Item = mongoose.model('Item', ItemSchema)

app.get('/items', async (req, res) => {
    const items = await Item.find();
    res.json(items);
})

app.post('/items', async (req, res) => {
    const newItem = new Item(req.body);
    await newItem.save();
    res.status(201).json(newItem);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
