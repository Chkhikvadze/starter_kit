
module.exports = {
	ping: ping
};


function ping(req, res) {
	res.ok(null, null, 'API server is working');
};