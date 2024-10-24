import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female'],
  },
  genderPreference: {
    type: String,
    required: true,
    enum: ['male', 'female', 'both'],
  },
  bio: { type: String, default: '' },
  image: { type: String, default: '' },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  dislikes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  matches: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
});

userSchema.pre("save", async function (next) {
  this.password = await bcrypt.hash(this.password, 10); // 비밀번호를 해시화(암호화)하여 저장
  next(); // 다음 미들웨어로 진행
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  // 입력된 비밀번호와 저장된 해시된 비밀번호를 비교하여 일치 여부를 반환
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
