#!/usr/bin/env node

var chalk = require('chalk');
var error = chalk.bold.red;
var success = chalk.bold.green;

var args = require('yargs').argv;
// validate
if (!args.email) {
	console.log(error("User email is required"));
	process.exit(0);
}

if (!args.password) {
	console.log(error("User password is required"));
	process.exit(0);
}


// connect to db  
var mongoose = require('mongoose');
mongoose.connect(require('../app/config').database.connection);

var User = require('../app/api/models/user');
var Role = require('../app/api/models/role');

var newUser = new User();
newUser.username = args.username || args.email,
newUser.email = args.email,
newUser.password = newUser.generateHash(args.password);
newUser.role = args.role || Role.ROLES.Researcher;
newUser.account.active = true;

// check if already exists
User.count()
	.or([{ username: newUser.username }, { email: newUser.email }])
	.exec(function (err, quantity) {
		if (quantity > 0) {
			console.log(success("User '%s' Already exists"), newUser.username);
			return process.exit(0);
		}

		newUser.save(function (err, user) {
			if (err) {
				console.log(error("Error creating user:"))
				console.log(error(err.message));
				return process.exit(0);
			}

			console.log(success("User '%s' Succesfully created"), user.username);
			process.exit(0);
		});
	});