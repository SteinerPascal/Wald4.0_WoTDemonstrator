import * as WoT from "wot-typescript-definitions"
var request = require('request');

const Ajv = require('ajv');
var ajv = new Ajv();

/*
https://github.com/launchcodedev/pi-camera-connect#readme
*/
import { StillCamera } from 'pi-camera-connect';


/*
pir motion sensor
https://medium.com/@dan.laidlow/raspberry-pi-home-security-with-node-js-node-installation-adding-an-lcd-pir-sensor-7ce1bdc1339
*/
var gpio = require('onoff').Gpio;
var pir = new gpio(11, 'in', 'high');



export class WotDevice {
    public thing: WoT.ExposedThing;
    public WoT: WoT.WoT;
    public td: any;
    constructor(WoT: WoT.WoT, tdDirectory?: string) {
        //create WotDevice as a server
        this.WoT = WoT;
        this.WoT.produce(
            //fill in the empty quotation marks
            {
                "@context": [
                    "https://www.w3.org/2019/wot/td/v1",
                    { "@language" : "en" }],
                "@type": "",
                id : "kwh-thingID-1",
                title : "kwh-thing",
                titles: {
                    "en": "kwh-thing",
                    "de": "kwh-ding",
                    "it": "kwh-cosa"
                },
                description : "This is an experimental kwh thing to showcase the possibilities of WoT",
                descriptions: {
                    "en": "This is an experimental kwh thing to showcase the possibilities of WoT",
                    "de": "Das ist ein experimentelles Ding mit welchem die Möglichkeiten des WoT gezeigt werden können",
                    "it": "Questa è una cosa sperimentale con cui si possono mostrare le possibilità di WoT"
                },
                support: "git://github.com/eclipse/thingweb.node-wot.git",
                securityDefinitions: { 
                    "": { 
                        "scheme": "" 
                    }
                },
                security: "",
                properties:{
                	movement:{
							title:"Counting the number of movements detected",
							description: "This kwh-thing includes a pir motion sensor. This field shows the number of movements which got detected",
							unit: "",
                            type: "integer",
                            observable: true,
                            readOnly: true
					}
				},
				actions:{
            		takePhoto:{
						title:"Takes img with the mounted camera",
						description: "On this kwh-thing there is a camera attached and if invoked will take an image",	
                        takePhoto: {
                            description: "Take photo",
                            input: {
                                type: "string"
                            },
                            forms: [{
                                    op:"invokeaction", //necessary?
                                    contentType: "image/png"
                                }],
                        }
					}
				},
                events:{
                	movementDetected:{
							title:"Trespassing alarm",
							description: "Event when subscribed notifies if movement gets detected from the PIR sensor",
							data:{
								unit: "",
								type: "string"
							}
							
					}
				},
            }
        ).then((exposedThing)=>{
			this.thing = exposedThing;
			this.td = exposedThing.getThingDescription();
		    this.add_properties();
			this.add_actions();
			this.add_events();
			this.thing.expose();
			if (tdDirectory) { this.register(tdDirectory); }
        });
    }
    
    public register(directory: string) {
        console.log("Registering TD in directory: " + directory)
        request.post(directory, {json: this.thing.getThingDescription()}, (error, response, body) => {
            if (!error && response.statusCode < 300) {
                console.log("TD registered!");
            } else {
                console.debug(error);
                console.debug(response);
                console.warn("Failed to register TD. Will try again in 10 Seconds...");
                setTimeout(() => { this.register(directory) }, 10000);
                return;
            }
        });
    }

    private myMovementHandler(){
		return new Promise((resolve, reject) => {
			// read something
			resolve(this.thing.readProperty("movement"));
		});
    }

    private myTakePhotoHandler(inputData){
		return new Promise((resolve, reject) => {
            // do something with inputData
            const imageTaken = async () => {
                const stillCamera = new StillCamera();
              
                const image = await stillCamera.takeImage();
              
                return image;
              };
              
              const myImage = imageTaken()
			resolve(myImage);
		});	
    }

    private listenToMotion() {
    	
		pir.watch((_err,value) => {
            if(value == 1) {
                console.log("movement detected! emitting event...")
                this.thing.emitEvent("myEvent","movement got detected");
            }
        });
		    	
	}

    private add_properties() {
        this.thing.writeProperty("movement",0); 
		this.thing.setPropertyReadHandler("movement", this.myMovementHandler)
		
    }

    private add_actions() {
        //fill in add actions
        this.thing.setActionHandler("takePhoto",(inputData) => {            
         	return new Promise((resolve, reject) => {
	            if (!ajv.validate(this.td.actions.takePhoto.input, inputData)) {
	                reject(new Error ("Invalid input"));
	            }
	            else {
	                resolve(this.myTakePhotoHandler(inputData));
	            }
	        });
        });
    }

    private add_events() {
		this.listenToMotion();
    }
}