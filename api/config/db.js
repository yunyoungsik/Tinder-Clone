import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
		const conn = await mongoose.connect(process.env.MONGO_URI);
		console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("Error: connecting to MongoDB", error)
    process.exit(1); // 오류가 발생하면 프로세스를 종료합니다 (1: 오류, 0: 정상 종료)
  }
}