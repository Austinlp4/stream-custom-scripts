exports.getDefaultParameters = function() {
	return new Promise((resolve, reject) => {
		resolve({
			chatter: {
				type: "enum",
				options: ["Streamer", "Bot"],
				default: "Bot",
				description: "Send From",
				secondaryDescription: "Which account to send the messages from."
			},
			hostViewerCountMessageTemplate: {
				type: "string",
				description: "Hostcount message template when hostee brings along more than 1 viewers.",
				secondaryDescription: "The message to show in chat. Here are some variables you can use in this message: ${user}, $(numViewers)",
				default: "${user} just hosted us with ${numViewers} viewers."
			},
			hostMessageTemplate: {
				type: "string",
				description: "Hostcount message template when hostee brings less than 1 viewers.",
				secondaryDescription: "The message to show in chat. Here are some variables you can use in this message: ${user}, $(numViewers)",
				default: "${user} just hosted us on their channel."
			}

		});
	});
}

exports.getScriptManifest = function() {
	return {
		name: "Host viewer count",
		description: "Allows you announce how many viewers joined on the host",
		author: "ThePerry",
		version: "0.3"
	}
}

function run(runRequest) {
	var username = runRequest.user.name;

	var shouldWhisper = runRequest.parameters.shouldWhisper;

	const request = runRequest.modules.request;
	const utils = runRequest.modules.utils;

	// Return a Promise object
	return new Promise((resolve, reject) => {
		var url = "https://mixer.com/api/v1/channels/"+ username +"?fields=viewersCurrent";
		let hostViewerCountMsgTemplate = runRequest.parameters.hostViewerCountMessageTemplate;
		let hostMsgTemplate = runRequest.parameters.hostMessageTemplate;

		request(url, function (error, response, data) {
			var response = {};
			if (!error) {
				// Got response from Mixer.
				var data = JSON.parse(data);
				let message;
				let string;
				variables = [
					{key: "${user}", replacement: username},
					{key: "${numViewers}", replacement: data.viewersCurrent}
				];

				if (data.viewersCurrent == undefined) {
					console.log("fallback");
					string = hostMsgTemplate;
					variables.forEach((keys) => {
						string = string.replace(new RegExp(utils.escapeRegExp(keys.key), "g"), keys.replacement);
					});
					message = string;
				}else if(data.viewersCurrent > 0){
					string = hostViewerCountMsgTemplate;
					variables.forEach((keys) => {
						string = string.replace(new RegExp(utils.escapeRegExp(keys.key), "g"), keys.replacement);
					});
					message = string;
				}else if(data.viewersCurrent === 0){
					string = hostMsgTemplate;
					variables.forEach((keys) => {
						string = string.replace(new RegExp(utils.escapeRegExp(keys.key), "g"), keys.replacement);
					});
					message = string;
				}

				// Create a success response
				response = {
					success: true,
					effects:[
						{
							type: EffectType.CHAT,
							message: message,
							chatter: runRequest.parameters.chatter
						}
					]
				}
			} else {
				// We had an error with the mixer request. So, create an error popup in Firebot.
				// Create a failed response
				response = {
					success: false,
					errorMessage: 'There was an error retrieving data from the Mixer API.'
				}
			}
		// Resolve Promise with the response object
		resolve(response);
		})
	});
}

// Export 'run' function so it is visible to Node
exports.run = run;