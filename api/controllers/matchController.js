import User from '../models/User.js';

export const swipeRight = async (req, res) => {
  try {
    const { likedUserId } = req.params;
    const currentUser = await User.findById(req.user.id);
    const likedUser = await User.findById(likedUserId);

    if (!likedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!currentUser.likes.includes(likedUserId)) {
      currentUser.likes.push(likedUserId);
      await currentUser.save();

      // 만약 상대방이 이미 우리를 좋아했다면 매치가 성사된 것이므로, 두 사용자 정보를 업데이트합니다.
      if (likedUser.likes.includes(currentUser.id)) {
        currentUser.matches.push(likedUserId);
        likedUser.matches.push(currentUser.id);

        // 두 사용자의 정보가 매치되면, 두 사용자 정보를 동시에 저장합니다.
        await Promise.all([
          await currentUser.save(), // currentUser의 정보를 DB에 저장
          await likedUser.save(), // likedUser의 정보를 DB에 저장
        ]);
        // Promise.all()을 사용한 이유:
        // - 두 개의 저장 작업을 병렬로 실행하여 성능을 최적화합니다.
        // - 두 작업 중 하나라도 실패하면 전체 작업이 에러로 처리됩니다.
        // - await를 사용해 두 저장 작업이 완료될 때까지 기다립니다.
      }
    }

    res.status(200).json({ success: true, user: currentUser });
  } catch (error) {
    console.log('Error in swipeRight: ', error);

    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
export const swipeLeft = async (req, res) => {
  try {
    const { dislikedUserId } = req.params;
    const currentUser = await User.findById(req.user.id);

    // currentUser.dislikes 배열에 dislikedUserId가 포함되어 있는지 확인합니다.
    if (!currentUser.dislikes.includes(dislikedUserId)) {
      currentUser.dislikes.push(dislikedUserId);
      await currentUser.save();
    }

    res.status(200).json({ success: true, user: currentUser });
  } catch (error) {
    console.log('Error in swipeLeft: ', error);

    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
export const getMatches = async (req, res) => {
  try {
    const user = await User.findById(req, user.id).populate('matches', 'name image');
    // 'matches' 필드에 저장된 참조된 문서의 'name'과 'image' 필드만 가져옴
    // 1. findById(req.user.id): 요청한 사용자의 ID로 User 컬렉션에서 해당 사용자를 조회합니다.
    // 2. populate('matches', 'name image'):
    //    - 'matches' 필드에 참조된 다른 컬렉션의 데이터를 ID 대신 조회합니다.
    //    - 'name'과 'image' 필드만 선택적으로 가져와서 성능을 최적화합니다.
    //    - 이 과정을 통해 'matches' 필드가 ID 배열이 아닌 실제 데이터로 채워집니다.

    res.status(200).json({
      success: true,
      matches: user.matches,
    });
  } catch (error) {
    console.log('Error in getMatches: ', error);

    res.status(500).json({
      success: false,
      message: 'Error in getMatches',
    });
  }
};
export const getUserProfiles = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const users = await User.find({
      $and: [
        // 여러 조건을 모두 만족하는 문서만 조회 (AND 연산자)
        { _id: { $ne: currentUser.id } }, // 현재 사용자가 아닌 다른 사용자들만 조회 (ID가 같지 않은 경우)
        { _id: { $nin: currentUser.likes } }, // 현재 사용자가 '좋아요'한 목록에 없는 사용자들만 조회
        { _id: { $nin: currentUser.dislikes } }, // 현재 사용자가 '싫어요'한 목록에 없는 사용자들만 조회
        { _id: { $nin: currentUser.matches } }, // 현재 사용자의 '매칭된' 사용자 목록에 없는 사용자들만 조회
        {
          // 성별 필터 설정
          gender:
            currentUser.genderPreference === 'both' // 사용자가 'both'를 선호하면
              ? { $in: ['male', 'female'] } // 남성과 여성 모두 포함
              : currentUser.genderPreference, // 그렇지 않으면 사용자가 설정한 성별만 조회
        },
        { genderPreference: { $in: [currentUser.gender, 'both'] } }, // 상대방의 선호 성별이 나(현재 사용자)의 성별이거나 'both'인 경우만 조회
      ],
    });
    // $and: 모든 조건을 동시에 만족하는 문서만 반환합니다.
    // $ne: 지정한 값과 같지 않은 문서를 찾습니다.
    // $nin: 지정된 배열에 포함되지 않는 문서만 반환합니다.
    // $in: 배열 내 값들 중 하나와 일치하는 문서를 반환합니다.

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.log('Error in getUserProfiles: ', error);

    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
