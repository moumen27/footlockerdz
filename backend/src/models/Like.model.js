import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  products: [{ type: String }] // array of productIds
}, { timestamps: true });

const Like = mongoose.model('Like', likeSchema);
export default Like;
