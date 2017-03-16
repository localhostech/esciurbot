const VK = require('./vk.js');
const TG = require('./telegram.js');
const WA = require('./wa.js');
//var User = require('../app.js');

let callbacks = {};
let Bot = {
	on: (event, callback) => {
		callbacks[event] = callback;
	},
	init: (options) => {
		if (options.vk) {
			VK.setPolling(options.vk.access_token, function() {
				console.log('Polling set');
			});
			VK.on('message', function(message) {
				if (message.out == 0) {
					callbacks.message(message);
				}
				
			});
		}
	},
	sendMessage: (options, callback) => {
		VK.api("messages.send", {user_id: options.user_id, message: encodeURIComponent(options.text), access_token:options.access_token}, callback);
	}
}


module.exports = Bot;