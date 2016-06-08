

module.exports = {
	database: {
		connection: 'mongodb://localhost:27017/starter_kit_Test'
	},
    
    mailService: require('../api/services/testMailService')
};