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
    return new Promise(async resolve => {
        let response = {
            success: true,
            effects: [
                {
                    type: EffectType.UPDATE_BUTTON,
                    chatter: "Streamer"
                }
            ]
        }

        console.log(runRequest.button.text)
        console.log('Response', response)

        let controlName = runRequest.button.name;
        let buttonId = runRequest.parameters.buttonToUpdate;

        if(buttonId === "" || buttonId == null) {
			buttonId = controlName;
        }
        
        const triggerType = runRequest.trigger.type;
        if(triggerType !== "interactive" && triggerType !== "manual") return resolve();
        
        let interactive = runRequest.modules.interactive;
	
        let control = await interactive.getButtonById(buttonId);
        
        let controlText = control.text;

        let username = runRequest.user.name;

        const nameArray = [controlText, username]

        let randomName = nameArray[Math.floor(Math.random()*nameArray.length)];

        control.update({
            text: randomName
        })

        if(!error){
            response.effects = runRequest.parameters.updateButton
        }

        resolve(response);


    })
}
exports.run = run;