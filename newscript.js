exports.getDefaultParameters = function() {
	return new Promise((resolve, reject) => {
		resolve({
            buttonToUpdate: {
                type: "string",
                description: "Button Id To Update",
				secondaryDescription: "The ID of the button (not the text!) that you want the progress bar to be updated on. Leave blank to use the current button.",
				default: "",
				showBottomHr: true	
            },
            updateButton: {
                type: "string",
                description: 'update button text',
                default: "Take the Hill"
            },
            chatter: {
				type: "enum",
				options: ["Streamer", "Bot"],
				default: "Bot",
				description: "Send From",
				secondaryDescription: "Which account to send the messages from."
			},
			challengeMessageTemplate: {
				type: "string",
				description: "Hill challenger message template",
				secondaryDescription: "The message to show in chat. Here are some variables you can use in this message: ${streamer}",
				default: "${user} has triumphed and becomes King of the Hill"
			}
        });
	});
}

exports.getScriptManifest = function() {
	return {
		name: "Take the Hill",
		description: "User storms the hill.",
		author: "Austinlp4",
		version: "0.1"	
	}
}


function run(runRequest) {
    const fs = runRequest.modules.fs;	
	const authFile = JSON.parse(fs.readFileSync(SCRIPTS_DIR + "../auth.json", 'utf8'));
	const channelId = authFile.streamer.channelId;
	const streamerName = authFile.streamer.username;
	
    const request = runRequest.modules.request;
    
    return new Promise(async resolve => {

    // check o make sure this is only being triggered by a mixplay button 
    // (we still allow manual execution so not a perfect safe guard)
    const triggerType = runRequest.trigger.type;
    if(triggerType !== "interactive" && triggerType !== "manual") {
        return resolve({
            success: false,
            errorMessage: "This script can only be used on an interactive control!"
        });
    }

    // get firebot's interactive module
    const interactive = runRequest.modules.interactive;

    // get the control name/id from the button this script is saved to
    const controlId = runRequest.button.name;
    
    // get mixplay control object from firebots interactive module
    let control = await interactive.getButtonById(controlId);

    // if(randomName == undefined){
    //     randomName = username;
    // }

    // const myString = `Challenge the Hill ${randomName}
    // update the control with new metadata object
    let username = runRequest.user.name;
    // let current = runRequest.button.text;
    let current = control.text.replace('Challenge the Hill', '');
    if(current.length === 0){
        current = username
    }
    const nameArray = [current, username]
    console.log('current', current)
    console.log('username', username)
    let randomName = nameArray[Math.floor(Math.random()*nameArray.length)];

    if(current === "Take the Hill"){
        randomName = username
    } 

    control.update({
        text: `Challenge the Hill ${randomName}`
    });
    
      var url = "https://mixer.com/api/v1/channels/"+ channelId;
      let challengeMessageTemplate = runRequest.parameters.challengeMessageTemplate;
      

      request(url, function (error, response, data) {
          var response = {};
          if (!error) {
              // Got response from Mixer.
              var data = JSON.parse(data);
              let message = challengeMessageTemplate
              .replace("${user}", randomName)
        
              
              // Create a response 
            response = {
                success: true,
                errorMessage: "Failed to run the script!", // If 'success' is false, this message is shown in a Firebot popup.
                effects: [ // An array of effect objects to run
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
          console.log('global', global)
      // Resolve Promise with the response object
      resolve(response);
      })
});
}
exports.run = run;