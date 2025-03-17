import mongoose from 'mongoose';
import User from '../user/accountModel.js';

const messageSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        trim: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: true
    },
    chatId: {
        type: String,
        default: 'global'
    },
    isGroupChat: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Message = mongoose.model('Message', messageSchema);
export default Message;
