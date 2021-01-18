
/*
    WoT Dependencies
*/
import { Helpers, Servient } from "@node-wot/core";
import { WoT } from "wot-typescript-definitions";
import * as BindingHttp from "@node-wot/binding-http";
import * as fs from "fs";
import SparqlClient from 'sparql-http-client';



/*
SPARQL setup
*/
// enable types in for each
interface SparqlResult {
    row: [
        {
            value: string
            termType: string;

        }
    ]
}

const endpointUrl = 'http://172.17.0.2:7200/repositories/WaldHolzDemonstrator'
const query = `
PREFIX ml40: <http://www.kwh-ontology/ml40#>
PREFIX fml40: <http://www.kwh-ontology/fml40#>
PREFIX ssn: <http://purl.oclc.org/NET/ssnx/ssn#>
PREFIX td: <http://mywotontology#>
select ?endpoint ?feature where { 
	?s a ml40:Device.
    ?sensor a ssn:SensingDevice .
    ?s ml40:hasSensor ?sensor.
    ?s fml40:Endpoint ?endpoint .
    ?feature a fml40:ObservingJob .
    ?s fml40:hasFeature ?feature   
    
} limit 100`

const client = new SparqlClient({ endpointUrl });

const querySparql = () => {
    return new Promise(async (resolve, rejects) => {
        const stream = await client.query.select(query)

        stream.on('data', (row: SparqlResult) => {
            let endvalues = [];
            Object.values(row).forEach((value) => {
                console.log(`${value.value} (${value.termType})`)
                let splits = value.value.split('#');
                endvalues.push(splits[splits.length - 1])
                //resolve(endvalues)
            });
        });

        await stream.on('error', err => {
            console.error(err)
            rejects()
        });
    });
}

/*
    Setting up WoT Servient
*/
let WoTHelpers: Helpers;
let WoT: WoT;
let servient = new Servient;
servient.addClientFactory(new BindingHttp.HttpClientFactory());

querySparql().then(async (endvalues) => {
    //initWoT()
    WoT = await servient.start()
    WoTHelpers = new Helpers(servient)
    //starting servient

    WoTHelpers.fetch(endvalues[0]).then(async (td) => {
        // using await for serial execution (note 'async' in then() of fetch())
        try {
            let thing = await WoT.consume(td);
            // logging the Thing description to console
            console.info("=== TD ===");
            console.info(td);
            console.info("==========");

            thing.subscribeEvent(endvalues[1], async data => {
                // the data sent when Event got triggered
                console.log(data);
                await thing.invokeAction('takePhoto', 'testinput');

                // readproperty snapshot to retrieve the photo taken
                let image = await thing.readProperty('lastSnapshot');
                fs.writeFile(`../retrievedimage3${new Date()}.png`, image.toString(), 'base64', (err) => {
                    if (err)
                        return console.log(`error happened ${err}`);
                    console.log('wrote file');
                });
            });
        }
        catch (err) {
            console.error("Script error:", err);
        }
    }).catch((err) => { console.error("Fetch error:", err); });

})




