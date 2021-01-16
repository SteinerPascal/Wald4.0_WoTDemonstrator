import * as WoT from "wot-typescript-definitions"
var request = require('request');

import * as fs from "fs"

const Ajv = require('ajv');
var ajv = new Ajv();

/*
https://github.com/launchcodedev/pi-camera-connect#readme
*/
import { StillCamera } from 'pi-camera-connect';

/*
pir motion sensor
https://github.com/opedromiranda/pi-pir-sensor
*/
var Sensor = require('pi-pir-sensor');


export class WotDevice {
    public thing: WoT.ExposedThing;
    public WoT: WoT.WoT;
    public td: any;
    // movement as property. in practice the value should come from the device.
    public movements: number = 0;
    // property lastSnapshot
    public lastSnapshot: Buffer;
    constructor(WoT: WoT.WoT, tdDirectory?: string) {
        //create WotDevice as a server
        this.WoT = WoT;
        this.WoT.produce(
            {
                "@context": [
                    "https://www.w3.org/2019/wot/td/v1",
                    { fml40: "www.kwh-example-uri-fml40#" },
                    { "@language": "en" }],
                "@type": "fml40:ObservierungsGerät",
                id: "W&HThingId",
                title: "DTThing",
                titles: {
                    "en": "W&H-thing",
                    "de": "W&H-ding",
                    "it": "W&H-cosa"
                },
                description: "This is an experimental kwh thing to showcase the possibilities of WoT",
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
                properties: {
                    movement: {
                        title: "Counting the number of animal movements detected",
                        description: "This kwh-thing includes a pir motion sensor. This field shows the number of movements which got detected",
                        unit: "",
                        type: "integer",
                        observable: false,
                        readOnly: true
                    },
                    lastSnapshot: {
                        title: "last snapshot taken with camera",
                        description: "The action takePhoto takes a picture and saves it as lastSnapshot property",
                        forms: [{
                            op: "readproperty",
                            contentType: "image/png"
                        }],
                        observable: false,
                        readOnly: true
                    },
                    location: {
                        "@type": "http://www.w3.org/2003/01/geo/wgs84_pos#",
                        title: "The coordinates of the device",
                        titles: {
                            "de": "Koordinaten des Gerätes",
                            "it": "Coordinato del dispositivo"
                        },
                        description: "These coordinates are showing the current location of the device. They get updated every 20 minutes",
                        type: "integer",
                        readOnly: true,

                    },

                },
                actions: {
                    takePhoto: {
                        title: "Takes img with the mounted camera",
                        description: "On this kwh-thing there is a camera attached and if invoked will take an image",
                        input: {
                            type: "object",
                            testparam: {
                                type: "string"
                            }
                        },
                        forms: [{
                            op: "invokeaction",
                            contentType: "application/json",
                        }],
                    }
                },
                events: {
                    movementDetected: {
                        "@type": "fml40:AnimalMovement",
                        title: "Trespassing alarm",
                        description: "Event when subscribed notifies if movement gets detected from the PIR sensor",
                        data: {
                            unit: "",
                            type: "string"
                        }
                    }
                },
            }
        ).then((exposedThing) => {
            this.thing = exposedThing;
            this.td = exposedThing.getThingDescription();
            console.log(JSON.stringify(this.td))
            this.add_properties();
            this.add_actions();
            this.add_events();
            this.thing.expose();
            if (tdDirectory) { this.register(tdDirectory); }
        });
    }

    public register(directory: string) {
        console.log("Registering TD in directory: " + directory)
        request.post(directory, { json: this.thing.getThingDescription() }, (error, response, body) => {
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

    public movementHandler() {
        return new Promise(async (resolve, reject) => {
            resolve(this.movements);
        });
    }

    public lastSnapshotHandler() {
        return new Promise(async (resolve, reject) => {
            resolve(this.lastSnapshot);
        });
    }

    private myTakePhotoHandler() {
        return new Promise<void>(async (resolve, reject) => {
            console.log(JSON.stringify(this.td.actions.takePhoto))
            console.log('method called');
            const imageTaken = async () => {
                const stillCamera = new StillCamera();

                const image = await stillCamera.takeImage();
                return image;
            };
            const myImage = await imageTaken()
            await fs.writeFile(`takePhoto${new Date()}.png`, myImage, (err) => {
                if (err) return console.log(`error happened ${err}`);
                console.log('wrote file');
            })
            this.lastSnapshot = myImage
            //this.lastSnapshot = "iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="
            resolve();
        });
    }

    private listenToMotion() {
        console.log('listened to motion called')
        var sensor = new Sensor({
            // pin number 11 adjust if necessary
            pin: 11,
            // loop time to check PIR sensor, set to 1sec
            loop: 1000
        });

        // Movement listener for PIR sensor, currently only one eventemit possible see: https://github.com/eclipse/thingweb.node-wot/issues/323
        sensor.on('movement', () => {
            this.thing.emitEvent('movementDetected', `PIR Motion sensor movement Nr. ${this.movements} detected`);
            this.movements++;

        });
        sensor.start();
    }

    private add_properties() {
        console.log('writeproperty called')
        this.thing.setPropertyReadHandler("movement", () => {
            return new Promise((resolve, reject) => {
                resolve(this.movementHandler())
            });
        });
        this.thing.setPropertyReadHandler("lastSnapshot", () => {
            return new Promise((resolve, reject) => {
                resolve(this.lastSnapshotHandler())
            });
        });
    }

    private add_actions() {
        //fill in add actions

        this.thing.setActionHandler("takePhoto", (inputData) => {
            return new Promise((resolve, reject) => {

                if (!ajv.validate(this.td.actions.takePhoto.input, inputData)) {
                    reject(new Error("Invalid input"));
                }

                resolve(this.myTakePhotoHandler());
            });
        });
    }

    private add_events() {
        this.listenToMotion();
    }
}