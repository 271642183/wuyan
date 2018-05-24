const express = require('express')
const router = express.Router()

const checkLogin = require('../middlewares/check').checkLogin
const PostModel = require('../models/posts')

const path = require('path')
/*var fs = require('fs')
var file = path.join("./public/js/posts.json")
var result = JSON.parse(fs.readFileSync(file)).data*/


//get /posts 所有
router.get('/', function(req, res, next) {
  const author = req.query.author

  PostModel.getPosts(author)
    .then( (posts) =>{
      console.log(posts)
      res.render('posts',{
        posts: posts,
        post: null
      })
    })
    .catch(next)
});

// POST /posts/create 发表一篇文章
router.post('/create', checkLogin, function (req, res, next) {
  const author = req.session.user._id
  const title = req.fields.title
  const content = req.fields.content
  const description = req.fields.description
  console.log("创建文章")
  console.log(title)
  console.log(content)
  console.log(description)
  // 校验参数
  try {
    if (!title.length) {
      throw new Error('请填写标题')
    }
    if (!content.length) {
      throw new Error('请填写内容')
    }
    if (!description.length) {
      throw new Error('请填写简介')
    }
  } catch (e) {
    req.flash('error', e.message)
    console.log("失败")
    console.log(e.message)
    return res.redirect('back')
  }

  let post = {
    author: author,
    title: title,
    content: content,
    description: description,
    pv: 0
  }

  PostModel.create(post)
    .then(function (result) {
      // 此 post 是插入 mongodb 后的值，包含 _id
      post = result.ops[0]
      req.flash('success', '发表成功')
      // 发表成功后跳转到该文章页
      res.redirect(`/posts/${post._id}`)
    })
    .catch(next)
})

// GET /posts/create 发表文章页
router.get('/create', checkLogin, function (req, res, next) {
  res.render('create')
})

router.get('/:postId', function(req, res, next) {
	const postId = req.params.postId
  Promise.all([
    PostModel.getPostById(postId), // 获取文章信息
    PostModel.incPv(postId)// pv 加 1
  ])
    .then(function (result) {
      const post = result[0]
      if (!post) {
        throw new Error('该文章不存在')
      }
      res.render('post', {
        post: post
      })
    })
    .catch(next)
})

// GET /posts/:postId/edit 更新文章页
router.get('/:postId/editPost', checkLogin, function (req, res, next) {
  const postId = req.params.postId
  const author = req.session.user._id

  PostModel.getRawPostById(postId)
    .then((post)=>{
      if(!post){
        throw new Error('该文章不存在~！')
      }
      if(author.toString() !== post.author._id.toString()){
        throw new Error('权限不足~！')
      }
      res.render('editPost', {
        post: post
      })
    })
    .catch(next)
})
// POST /posts/:postId/edit 更新一篇文章
router.post('/:postId/editPost', checkLogin, function (req, res, next) {
  const postId = req.params.postId
  const author = req.session.user._id
  const title = req.fields.title
  const content = req.fields.content
  const description = req.fields.description

  // 校验参数
  try {
    if (!title.length) {
      throw new Error('请填写标题')
    }
    if (!content.length) {
      throw new Error('请填写内容')
    }
     if (!description.length) {
      throw new Error('请填写简介')
    }
  } catch (e) {
    req.flash('error', e.message)
    return res.redirect('back')
  }

  PostModel.getRawPostById(postId)
    .then(function (post) {
      if (!post) {
        throw new Error('文章不存在')
      }
      if (post.author._id.toString() !== author.toString()) {
        throw new Error('没有权限')
      }
      PostModel.updatePostById(postId, { title: title, content: content, description: description})
        .then(function () {
          req.flash('success', '编辑文章成功')
          // 编辑成功后跳转到文章页
          res.redirect(`/posts/${postId}`)
        })
        .catch(next)
    })
})

// GET /posts/:postId/remove 删除一篇文章
router.get('/:postId/remove', checkLogin, function (req, res, next) {
  const postId = req.params.postId
  const author = req.session.user._id

  PostModel.getRawPostById(postId)
    .then(function (post) {
      if (!post) {
        throw new Error('文章不存在')
      }
      if (post.author._id.toString() !== author.toString()) {
        throw new Error('没有权限')
      }
      PostModel.delPostById(postId)
        .then(function () {
          req.flash('success', '删除文章成功')
          // 删除成功后跳转到主页
          res.redirect('/admin')
        })
        .catch(next)
    })
})



module.exports = router;