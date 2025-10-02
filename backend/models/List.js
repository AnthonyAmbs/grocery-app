import mongoose from 'mongoose';

const { Schema } = mongoose;

const ItemSchema = new mongoose.Schema({
    name: {type: String, required: true},
    quantity: {type: Number, default: 1},
    category: {type: String}
});

const ListSchema = new Schema({
    name: {type: String, required: true},
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    collaborators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    items: [ItemSchema]
}, {timestamps: true});

export default mongoose.model('List', ListSchema);