exports.getScriptManifest = function() {
	return {
		name: "Advanced Progress Bar Button",
		description: "Allows you to play an effects depending on the level of the progress bar. For every click when the progress bar isnt 100%, the first effect list is used. When the bar reaches 100, the second effect list is played. To reset simply have any effect on this or another button set the progress bar to 0.",
		author: "ebiggz",
		version: "1.3"
	}
}

function getDefaultParameters() {
    return new Promise((resolve, reject) => {
        resolve({
			"buttonToUpdate": {
                "type": "string",
                "description": "Button Id To Update",
				"secondaryDescription": "The ID of the button (not the text!) that you want the progress bar to be updated on. Leave blank to use the current button.",
				"default": "",
				showBottomHr: true	
            },
			"incrementPercentage": {
                "type": "string",
                "description": "Increment Percentage",
				"secondaryDescription": "How much each click should advance the progress bar. Ie '1' would mean 100 clicks would be required.",
				"default": 1,
				showBottomHr: true		
            },
			"perClickEffects": {
                "type": "effectlist",
                "description": "Effects to run when NOT 100%",
				"secondaryDescription": "These effects are run every time the button is clicked and the progress bar it not 100% yet.",
				"default": [],
				showBottomHr: true
			},
			"hundredPercentEffects": {
                "type": "effectlist",
                "description": "Effects when 100%",
				"secondaryDescription": "These effects are run once the button progress bar reaches 100%. The effects are only ran once upon reaching 100%. Any subsequent clicks will not trigger effects until the button progress bar is reset to less than 100%.",
				"default": []
            },
        });
    });
}
exports.getDefaultParameters = getDefaultParameters;

function run(runRequest) {
    return new Promise(async resolve => {

		let response = {
			success: true,
			effects: []
		}

		let controlName = runRequest.button.name;
		let buttonId = runRequest.parameters.buttonToUpdate;
		
		if(buttonId === "" || buttonId == null) {
			buttonId = controlName;
		}
		
		//ensure global state object is present
		if(global.fullProgressButtons == null) {
			global.fullProgressButtons = {};
		}

		const moment = runRequest.modules.moment;

		// first check for already 100.
		let last100 = global.fullProgressButtons[buttonId];
		if(last100) {
			let diff = moment().diff(last100, "seconds");
			if(diff < 3) {
				return resolve(response);
			}
		}

		const triggerType = runRequest.trigger.type;
		if(triggerType !== "interactive" && triggerType !== "manual") return resolve();

		let interactive = runRequest.modules.interactive;
	
		let control = await interactive.getButtonById(buttonId);

		let currentProgress = control.progress || 0;

		if(currentProgress < 1) {
			// ensure fullprogress flag is reset
			if(global.fullProgressButtons[buttonId]) {
				delete global.fullProgressButtons[buttonId];
			}
		}
		
		const util = runRequest.modules.utils;

		let incrementPercentage = 
			await util.populateStringWithTriggerData(runRequest.parameters.incrementPercentage, runRequest.trigger);

		let incrementAmount = incrementPercentage / 100;

		//update by set amount
		let updatedProgress = currentProgress + incrementAmount;
		console.log(updatedProgress);
		if(updatedProgress > 0.990) {
			updatedProgress = 1;
		}

		control.update({
			progress: updatedProgress
		});

		if(updatedProgress < 1) {
			response.effects = runRequest.parameters.perClickEffects;
		} else {
			//second check for already 100.
			if(!global.fullProgressButtons[buttonId]) {
				//we havent run the 100% effects yet, set the flag so we dont do it again
				global.fullProgressButtons[buttonId] = moment();

				response.effects = runRequest.parameters.hundredPercentEffects;
			}
		}
		
		resolve(response);
    });
}
exports.run = run;