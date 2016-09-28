var express = require("express");
var router = express.Router();
var multiparty = require('connect-multiparty');
var fs = require('fs');
var path = require('path');
var hash = require('../models/pass').hash;
var User = require('../models/user'); //数据操作对象

/**
    操作cookie
**/
function setCookie(res, name, val, expire) {
	var days = expire * 24 * 60 * 60;
	res.cookie(name, val, {
		expires: new Date(Date.now() + days)
	});
}

 function delCookie(res, name) {
 	res.clearCookie(name);
 }

 function getCookie(req, key) {
 	if (typeof req.cookies[key] !== 'undefined') {
 		return req.cookies[key];
 	}
 	   return undefined;
 }

/***
   登录页面路由
**/
router.get('/login', function(req, res){
	res.render('login', {
		title: '登录页面'
	});
});


router.post('/login', function(req, res){
	    var user = {
	      name: req.body.user.name,
	      password: req.body.user.password  	
	    };
		User.findOne({name:user.name,password:user.password},function(err,doc){
            if(!!doc){  
                console.log(user.name + ": 登陆成功 " + new Date());
                setCookie(res,'name',user.name,30);
                return res.redirect('./index.html');   
            }else{  
                console.log(user.name + ": 登陆失败" + new Date());  
                return res.redirect('./login');
            } 
		})		
});


/***
   首页路由
**/
var mediaPath = 'public/media';

fs.readdir(mediaPath, function(err, files) {
	var filesArr = files;
	console.log(filesArr)
		fs.writeFile('./public/file/media.txt', JSON.stringify(filesArr),function(err) {
			if (err) {
				console.log(err);
			}
		});
})

router.get(['/index.html','/'], function(req, res){
		var fs = require("fs");	
		   if(getCookie(req,'name')){
				fs.readdir(mediaPath, function(err, files){
					if(err){
						console.log(err);
					}else{
						res.render('index', {
							 title: '我的音乐',
							 music: files
					  });
					}
				});              
		   }else{
		   	 return res.redirect('./login');
		   }
});


/**
   文件上传路由
**/

router.post('/upload', multiparty(), function(req, res) {
  
  //get filename
  var filename = req.files.files.originalFilename || path.basename(req.files.files.ws.path);
  
  //copy file to a public directory
  //var targetPath = path.dirname(__filename) + '/public/media/' + filename;
  var targetPath = path.dirname('public') + '/public/media/' + filename;
  
  //copy file
  fs.createReadStream(req.files.files.ws.path).pipe(fs.createWriteStream(targetPath));
  
  //return file url
  res.json({code: 200, msg: {url: 'http://' + req.headers.host + '/' + filename}});

});


/**
   用户列表路由
***/


//获取用户列表
router.get('/users', function(req, res) {
  	User.find(function(err, user) {
  		if(err){
  			console.log(err);
  		}
		res.render('users', {
			title : '用户相关操作',
			user: user,
			oneUser: false
		})
	})
});

//修改数据
router.get('/users/update/:id', function(req, res) {
	var id = req.params.id;
	if (id) {
		//查找指定要修改的数据
		User.findOne({_id: id},function(err,oneUser){
			res.render('users', {
				 title : '用户相关操作',
				 oneUser : oneUser,
				 user : oneUser
			})
		})
	}
});


//更新数据
router.post('/users/update', function(req, res) {
	var oneUser = req.body.oneUser;
	if (!oneUser) {
		return
	}
	User.update({_id: oneUser._id}, {
		$set: {
			name: oneUser.name,
			password:oneUser.password
		}
	}, function(err) {
		if(err){
			console.log(err);
			return;
		}
		console.log('更新成功')
		return res.redirect('/users');
	});
});

//保存数据
router.post('/users/add', function(req, res) {
	var user = req.body.user;
	if (!user) {
		console.log(user);
		return;
	}
	var user = new User(user)
		//保存数据
	user.save(function(err) {
		if (err) {
			console.log('保存失败')
		}
		console.log('数据保存成功')
		return res.redirect('/users')
	});
});

//删除数据
router.get('/users/delete/:id', function(req, res) {
	var id = req.params.id;
	if (id) {
		User.remove({
			_id: id
		}, function(err) {
			if (err) {
				console.log(err)
				return
			}
			console.log('删除成功')
			return res.redirect('/users')
		});
	}
})


module.exports = router;