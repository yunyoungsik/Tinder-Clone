import Message from '../models/Message.js';
import { getConnectedUsers, getIO } from '../socket/socket.server.js';

export const sendMessage = async (req, res) => {
	try {
		const { content, receiverId } = req.body;

		const newMessage = await Message.create({
			sender: req.user.id,
			receiver: receiverId,
			content,
		});

		const io = getIO();
		const connectedUsers = getConnectedUsers();
		const receiverSocketId = connectedUsers.get(receiverId);

		if (receiverSocketId) {
			io.to(receiverSocketId).emit("newMessage", {
				message: newMessage,
			});
		}

		res.status(201).json({
			success: true,
			message: newMessage,
		});
	} catch (error) {
		console.log("Error in sendMessage: ", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};
export const getConversation = async (req, res) => {
	const { userId } = req.params;
	try {
		const messages = await Message.find({
       // $or 연산자를 사용하여 두 가지 조건 중 하나라도 만족하는 문서를 찾습니다.
			 $or: [
         // 현재 사용자가 메시지를 보낸 경우 (보내는 사람: req.user._id, 받는 사람: userId)
				 { sender: req.user._id, receiver: userId },
        // 상대 사용자가 메시지를 보낸 경우 (보내는 사람: userId, 받는 사람: req.user._id)
				{ sender: userId, receiver: req.user._id },
			],
		}).sort("createdAt"); // 메시지를 생성된 날짜 순서(오래된 것부터 최신 순서)로 정렬합니다.

    res.status(200).json({
			success: true,
			messages,
		});
	} catch (error) {
		console.log("Error in getConversation: ", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};