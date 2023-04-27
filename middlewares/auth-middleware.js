const jwt = require("jsonwebtoken");
const { Users } = require("../models");

// 사용자 인증 미들웨어
module.exports = async (req, res, next) => {
  const { Authorization } = req.cookies;
  const [authType, authToken] = (Authorization ?? "").split(" ");

  if (!authToken || authType !== "Bearer") {
    res.status(403).send({
      errorMessage: "로그인이 필요한 기능입니다.",
    });
    return;
  }

  try {
    const decodedToken = jwt.verify(authToken, "jjm-custom-secret-key");
    const userId = decodedToken.userId;
    const user = await Users.findOne({ where: { userId } });
    res.locals.user = user;
    next();
  } catch (err) {
    console.error(err);
    res.clearCookie("Authorization");
    return res.status(403).send({
      errorMessage: "전달된 쿠키에서 오류가 발생하였습니다",
    });
  }
};
