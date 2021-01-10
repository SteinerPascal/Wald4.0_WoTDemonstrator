import { Helpers,Servient } from "@node-wot/core";
import {WoT} from "wot-typescript-definitions"
import * as BindingHttp from "@node-wot/binding-http"


let WoTHelpers: Helpers;
let WoT:WoT

let servient = new Servient;
servient.addClientFactory(new BindingHttp.HttpClientFactory())
const initWoT = async () => {
    WoT = await servient.start()
}
initWoT()
WoTHelpers = new Helpers(servient)


WoTHelpers.fetch("http://192.168.8.123:8080/dtthing").then(async (td) => {
    // using await for serial execution (note 'async' in then() of fetch())
    try {
        let thing = await WoT.consume(td);
        console.info("=== TD ===");
        console.info(td);
        console.info("==========");
        thing.subscribeEvent('movementDetected', data => {
            console.log(data);
        })



        /* EXAMPLE CODE

        // read property #1
        let read1 = await thing.readProperty("count");
        console.info("count value is", read1);
        // increment property #1 (without step)
        await thing.invokeAction("increment");
        let inc1 = await thing.readProperty("count");
        console.info("count value after increment #1 is", inc1);
        // increment property #2 (with step)
        await thing.invokeAction("increment", undefined, { uriVariables: { 'step': 3 } });
        let inc2 = await thing.readProperty("count");
        console.info("count value after increment #2 (with step 3) is", inc2);
        // decrement property with formIndex == 2
        await thing.invokeAction("decrement", undefined, { formIndex: 2 });
        let dec1 = await thing.readProperty("count");
        console.info("count value after decrement is", dec1);
        */
    }
    catch (err) {
        console.error("Script error:", err);
    }
}).catch((err) => { console.error("Fetch error:", err); });