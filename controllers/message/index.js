import Message from '../../model/message/messageModel.js';

export const getMessages = async (req, res) => {
    try {
        const { chatId = 'global', limit = 50 } = req.query;

        // Get messages for specific chat
        const messages = await Message.find({ chatId })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .populate('sender', 'username')
            .sort({ createdAt: 1 });

        res.json({ messages });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createMessage = async (req, res) => {
    try {
        console.log(req.user); // Debugging

        if (!req.user || !req.user._id) {
            return res.status(400).json({ message: "Sender is required" });
        }

        const { content, chatId = 'global' } = req.body;

        // Create message
        const message = new Message({
            content,
            sender: req.user._id, // Fix: Use req.user._id instead of req.userId
            chatId
        });

        await message.save();
        await message.populate('sender', 'username');

        res.status(201).json({ message });
    } catch (error) {
        console.error('Create message error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

