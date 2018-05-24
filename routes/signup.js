var fs = require('fs');
var path = require('path');
var sha1 = require('sha1');

var express = require('express');
var router = express.Router();

var UserModel = require('../models/users');

var checkNotLogin = require('../middlewares/check').checkNotLogin;

// GET /signup 注册页
router.get('/', checkNotLogin, function(req, res, next){
	console.log('构造注册页模板n(*≧▽≦*)n');
	res.render('signup');

});

// POST /signup 用户注册页
router.post('/', checkNotLogin, function(req, res, next){
	console.log('用户注册程序启动^_^');
	var name = req.fields.name; //用户名
	var gender = req.fields.gender; //性别
	var bio = req.fields.bio; //简介
	var avatar = req.files.avatar.path.split(path.sep).pop();
	/*var avatar = req.fields.avatar.path.split(path.sep).pop();*/ //头像
	var password = req.fields.password; //密码
	var repassword = req.fields.repassword; //重复密码
/*知识点
* {js} .indexOf()
* {js} try{}catch{}
* 
*/
	try {
		console.log('检测填写疏漏^_^');
		if (!(name.length >= 1 && name.length <= 10)) {
      		throw new Error('名字请限制在 1-10 个字符');
    	}
    	if (['m', 'f', 'x'].indexOf(gender) === -1) {
      		throw new Error('性别只能是 m、f 或 x');
    	}
    	if (!(bio.length >= 1 && bio.length <= 30)) {
      		throw new Error('个人简介请限制在 1-30 个字符');
    	}
    	if (!req.files.avatar.name) {
      		throw new Error('缺少头像');
    	}
    	if (password.length < 6) {
      		throw new Error('密码至少 6 个字符');
    	}
    	if (password !== repassword) {
      		throw new Error('两次输入密码不一致');
    	}
	} catch (e) {
    	// 注册失败，异步删除上传的头像
    	fs.unlink(req.files.avatar.path);
    	req.flash('error', e.message);
    	return res.redirect('/signup');
  	}
  	password = sha1(password);

  	// 待写入数据库的数据整理
  	var user = {
  		name: name,
  		password: password,
  		gender: gender,
  		bio: bio,
  		avatar: avatar
  	};

  	//数据写入数据库
  	UserModel.create(user)
  		.then(function(result){
  			//此user是插入 mongodb 后的值，包含_id
  			user = result.ops[0];
  			//将用户信息存入 session
  			delete user.password;
  			req.session.user = user;
  			console.log('你的名字，刻骨铭心^_^》》信息注册中');
  			//写入 flash
  			req.flash('success', '注册成功');
  			// 跳转到首页
  			res.redirect('/posts');
  		})
  		.catch(function(e){
  			// 注册失败，异步删除上传的头像
      		fs.unlink(req.files.avatar.path);
      		// 用户名被占用则跳回注册页，而不是错误页
      		if (e.message.match('E11000 duplicate key')) {
        		req.flash('error', '用户注册失败，好白菜都让猪拱了...');
        		return res.redirect('/signup');
      		}
      		next(e);
  		});
	
});

module.exports = router;