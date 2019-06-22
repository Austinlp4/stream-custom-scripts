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
			followerCountMessageTemplate: {
				type: "string",
				description: "Followercount message template",
				secondaryDescription: "The message to show in chat. Here are some variables you can use in this message: ${streamer}",
				default: "${streamer} has ${numFollowers} followers."
			}
		});
	});
}

exports.getScriptManifest = function() {
	return {
		name: "Follower Count",
		description: "Allows you to check your follower count.",
		author: "ThePerry",
		version: "0.1"	
	}
}

function run(runRequest) {
	var username = runRequest.user.name;
	var shouldWhisper = runRequest.parameters.shouldWhisper;
	const fs = runRequest.modules.fs;	
	const authFile = JSON.parse(fs.readFileSync(SCRIPTS_DIR + "../auth.json", 'utf8'));
	const channelId = authFile.streamer.channelId;
	const streamerName = authFile.streamer.username;
	
	const request = runRequest.modules.request;
	
	// Return a Promise object
	return new Promise((resolve, reject) => {
		var url = "https://mixer.com/api/v1/channels/"+ channelId +"?fields=numFollowers";
		let followerCountMsgTemplate = runRequest.parameters.followerCountMessageTemplate;
		
		request(url, function (error, response, data) {
			var response = {};
			if (!error) {
				// Got response from Mixer.
				var data = JSON.parse(data);
				let message;
				if (data.numFollowers == undefined) {
					message = "An error occured...";
					
				}else{
					console.log("Followers?");
					message = followerCountMsgTemplate
						.replace("${streamer}", streamerName)
						.replace("${numFollowers}", data.numFollowers);
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