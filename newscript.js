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
        let username = runRequest.user.name;
        let current = runRequest.button.text;

        const nameArray = [current, username]

        let randomName = nameArray[Math.floor(Math.random()*nameArray.length)];

    // check to make sure this is only being triggered by a mixplay button 
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

    // update the control with new metadata object
    control.update({
        text: randomName
    });
    
    //resolve promise with default success object.
    resolve({
        success: true,
        effects: []
    });
    
});
}
exports.run = run;