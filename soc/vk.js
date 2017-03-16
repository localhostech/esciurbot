const fetch = require('node-fetch');
let toGetStr = (obj) => {
	let str = "";
	for (var key in obj) {
	    if (str != "") {
	        str += "&";
	    }
	    str += key + "=" + obj[key];
	}
	return str;
};
let callbacks = {};
let VK = {
	api: (method, options, callback) => {
		var options = toGetStr(options);
		fetch('https://api.vk.com/method/'+method+'?'+options+'&v=5.60')
		    .then(function(res) {
		        return res.json();
		    }).then(function(json) {
		        callback(json);
		    });
	},
	setPolling: (access_token, callback) => {
			fetch('https://api.vk.com/method/messages.getLongPollServer?access_token='+access_token+'&v=5.60')
			    .then(function(res) {
			        return res.json();
			    }).then(function(json) {
			        let setConnection = (ts) => {
			        	fetch("https://"+json.response.server+"?act=a_check&key="+json.response.key+"&ts="+ts+"&wait=25&mode=2&version=1")
				        	.then(function(res) {
						        return res.json();
						    }).then(function(json) {
						        if (json.updates.length > 0) {
						        	setConnection(json.ts);	
						        	json.updates.forEach((item) => {
						        		if (item[0] == 4) {
						        			fetch('https://api.vk.com/method/messages.getById?message_ids='+item[1]+'&access_token='+access_token+'&v=5.60')
											    .then(function(res) {
											        return res.json();
											    }).then(function(json) {
											    	var message = json.response.items[0];
											    	if (callbacks.message) {
											    		callbacks.message(message);
											    	}
											    });
						        		}
						        	});
						        } else {
						        	setConnection(json.ts);	
						        }
						    });
			        }
			        setConnection(json.response.ts);
			        callback();
			    });
	},
	on: (event, callback) => {
		callbacks[event] = callback;
	}
}
module.exports = VK;