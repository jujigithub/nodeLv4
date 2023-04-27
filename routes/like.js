const express = require("express");
const router = express.Router();
const { Likes } = require("../models");
const { Posts } = require("../models");
const authMiddleware = require("../middlewares/auth-middleware");
const Sequelize = require("sequelize");

// 좋아요 누르기랑 취소하기
router.put("/posts/:postId/like", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { userId } = res.locals.user;
  const existLike = await Likes.findOne({
    where: { PostId: postId, UserId: userId },
  });

  try {
    const post = await Posts.findOne({ where: { postId: postId } });
    if (!post) {
      res.status(404).json({ message: "게시글이 존재하지 않습니다." });
      return;
    }

    if (existLike) {
      await Likes.destroy({ where: { PostId: postId } });
      await Posts.update(
        { likes: Sequelize.literal("likes - 1") }, //시퀄라이즈 없이 순수 업데이트로 메소드로도 가능
        { where: { postId: postId } }
      );
      res.status(200).json({ message: "게시글의 좋아요를 취소하였습니다." });
    } else {
      await Likes.create({
        PostId: postId,
        UserId: userId,
      });
      await Posts.update(
        { likes: Sequelize.literal("likes + 1") },
        { where: { postId: postId } }
      );
      res.status(200).json({ message: "게시글을 좋아요를 등록하였습니다." });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      errorMessage: "게시글 좋아요에 실패하였습니다.",
    });
  }
});

//사용자가 좋아요누른 게시글 조회
router.get("/posts/like/read", authMiddleware, async (req, res) => {
  //api url이 겹처서 임의로 바꿔줬지만 app.js미들웨어의 라우터 입력순서를 변경해서 해결가능
  const { userId } = res.locals.user;
  const likes = await Likes.findAll({
    where: {
      UserId: userId,
    },
    attributes: ["PostId"],
  });

  const postIds = likes.map((a) => a.PostId); //likes배열로 가공
  const { Op } = require("sequelize");
  const posts = await Posts.findAll({
    where: {
      PostId: { [Op.in]: postIds }, //postIds 배열에 포함된 postId찾기
    },
    attributes: [
      "postId",
      "UserId",
      "nickname",
      "title",
      "likes",
      "createdAt",
      "updatedAt",
    ],
    order: [["likes", "DESC"]],
  });

  try {
    res.status(200).json({ posts });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      errorMessage: "좋아요 게시글 조회에 실패하였습니다.",
    });
  }
});

module.exports = router;
