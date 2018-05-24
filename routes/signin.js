var sha1 = require('sha1');

var express = require('express');
var router = express.Router();
var UserModel = require('../models/users');
var checkNotLogin = require('../middlewares/check').checkNotLogin;

//GET /signin 登录页
router.get('/', checkNotLogin, function(req, res, next){
	console.log('构造登录页模板n(*≧▽≦*)n');
	res.render('signin');
});

//POST /signin 用户登录
router.post('/', checkNotLogin, function(req, res, next){
	var name = req.fields.name;
	var password = req.fields.password;
	console.log('登录ing...Tip：英语老师说这是现在进行时~~！！');
	UserModel.getUserByName(name)
		.then(function(user){
			console.log('核对用户名与密码...');
			if(!user){
				req.flash('error','用户不存在');
				return res.redirect('back');
			}
			// 检查密码是否匹配
			if(sha1(password) !== user.password){
				req.flash('error','用户名或密码错误');
				return res.redirect('back');
			}
			console.log('welcome' + user.name +',故事从这里开始...');
			req.flash('success','登陆成功');
			// 用户信息写入 session
      		delete user.password;
      		req.session.user = user;
      		// 跳转到主页
      		res.redirect('/admin');
    		})
    		.catch(next);
});

module.exports = router;