const express = require("express");
const router = express.Router();
const { Posts } = require("../models");
const authMiddleware = require("../middlewares/auth-middleware");

// 전체 게시글 조회, 날짜 내림차순, content제외
router.get("/posts", async (req, res) => {
  try {
    const posts = await Posts.findAll({
      attributes: [
        "postId",
        "UserId",
        "nickname",
        "title",
        "createdAt",
        "updatedAt",
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ posts });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      errorMessage: "게시글 조회에 실패하였습니다.",
    });
  }
});

//게시글 상세 조회
router.get("/posts/:postId", async (req, res) => {
  const { postId } = req.params;
  const post = await Posts.findOne({
    where: {
      postId: postId,
    },
    attributes: [
      "postId",
      "UserId",
      "nickname",
      "title",
      "content",
      "likes",
      "createdAt",
      "updatedAt",
    ],
  });

  try {
    res.status(200).json({ post });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      errorMessage: "게시글 조회에 실패하였습니다.",
    });
  }
});

//게시글 작성
router.post("/posts", authMiddleware, async (req, res) => {
  const { userId, nickname } = res.locals.user;
  const { title, content } = req.body;

  try {
    if (Object.keys(req.body).length === 0) {
      res.status(412).json({ message: "데이터 형식이 올바르지 않습니다." });
      return;
    }

    if (title.length === 0) {
      res
        .status(412)
        .json({ message: "게시글 제목의 형식이 일치하지 않습니다." });
      return;
    }

    if (content.length === 0) {
      res
        .status(412)
        .json({ message: "게시글 내용의 형식이 일치하지 않습니다." });
      return;
    }

    await Posts.create({ UserId: userId, nickname, title, content });
    res.status(201).json({ message: "게시글 작성에 성공하였습니다." });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      errorMessage: "게시글 작성에 실패하였습니다.",
    });
  }
});

//게시글 수정
router.put("/posts/:postId", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { userId } = res.locals.user;
  const { title, content } = req.body;
  const post = await Posts.findOne({ where: { postId: postId } });

  try {
    if (Object.keys(req.body).length === 0) {
      res.status(412).json({ message: "데이터 형식이 올바르지 않습니다." });
      return;
    }

    if (title.length === 0) {
      res
        .status(412)
        .json({ message: "게시글 제목의 형식이 일치하지 않습니다." });
      return;
    }

    if (content.length === 0) {
      res
        .status(412)
        .json({ message: "게시글 내용의 형식이 일치하지 않습니다." });
      return;
    }

    if (post.UserId !== userId) {
      res
        .status(403)
        .json({ message: "게시글의 수정 권한이 존재하지 않습니다." });
      return;
    }

    await Posts.update(
      { title, content, updatedAt: Date.now() },
      { where: { postId: postId } }
    ).catch((err) => {
      console.log(err);
      res
        .status(401)
        .json({ errorMessage: "게시글이 정상적으로 수정되지 않았습니다." });
    });
    res.status(200).json({ message: "게시글을 수정하였습니다." });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      errorMessage: "게시글 수정에 실패하였습니다.",
    });
  }
});

//게시글 삭제
router.delete("/posts/:postId", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { userId } = res.locals.user;
  const post = await Posts.findOne({ where: { postId: postId } });

  try {
    if (!post) {
      res.status(404).json({ message: "게시글이 존재하지 않습니다." });
      return;
    }

    if (post.UserId !== userId) {
      res
        .status(403)
        .json({ message: "게시글의 삭제 권한이 존재하지 않습니다." });
      return;
    }

    await Posts.destroy({ where: { postId: postId } }).catch((err) => {
      res
        .status(401)
        .json({ errorMessage: "게시글이 정상적으로 삭제되지 않았습니다." });
    });

    res
      .status(200)
      .json({ message: "게시글과 해당 게시글의 댓글을 모두 삭제하였습니다." });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      errorMessage: "게시글 삭제에 실패하였습니다.",
    });
  }
});

module.exports = router;
