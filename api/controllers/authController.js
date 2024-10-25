import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const signToken = (id) => {
  // jwt token
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

export const signup = async (req, res) => {
  const { name, email, password, age, gender, genderPreference } = req.body;
  try {
    if (!name || !email || !password || !age || !gender || !genderPreference) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    if (age < 18) {
      return res.status(400).json({
        success: false,
        message: 'You must at lest 18 years old',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const newUser = new User.create({
      name,
      email,
      password,
      age,
      gender,
      genderPreference,
    });

    const token = signToken(newUser._id);

    res.cookie('jwt', token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일 동안 쿠키 유지 (밀리초 단위)
      httpOnly: true, // XSS(크로스 사이트 스크립팅) 공격을 방지하기 위해 클라이언트에서 쿠키에 접근 불가
      sameSite: 'strict', // CSRF(크로스 사이트 요청 위조) 공격 방지
      secure: process.env.NODE_ENV === 'production', // HTTPS 연결에서만 쿠키 전송
    });

    res.status(201).json({
      success: true,
      token,
      user: newUser,
    });
  } catch (error) {
    console.log('Error in signup controller: ', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = signToken(user._id);

    res.cookie('jwt', token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7일 동안 쿠키 유지 (밀리초 단위)
      httpOnly: true, // XSS(크로스 사이트 스크립팅) 공격을 방지하기 위해 클라이언트에서 쿠키에 접근 불가
      sameSite: 'strict', // CSRF(크로스 사이트 요청 위조) 공격 방지
      secure: process.env.NODE_ENV === 'production', // HTTPS 연결에서만 쿠키 전송
    });

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log('Error in login controller: ', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
export const logout = async (req, res) => {
  res.clearCookie('jwt');
  req.status(200).json({ success: true, message: 'Logged out successfully' });
};
