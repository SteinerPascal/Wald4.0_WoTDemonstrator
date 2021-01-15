# Exposing and consuming Things for a PoC in context of Digital Twins and [Wald & Holz 4.0](https://www.kwh40.de/)

This Repo contains a PoC to use WoT with digital twins. It's more a demonstration of the WoT technology then including it in the Wald & Holz Infrastracture. 
It was developed in the context of a semester work to show capabilities of WoT and Web semanic in Digital Twins and Digital Twin infrastructure. 

## Architecture

Above you can see the Archtiecture. The whole thing consists of two Eclipse [thingweb](https://github.com/eclipse/thingweb.node-wot/) Servients connected with each other. The right Servient takes on the role of a server and the left one takes on the role of a client. Above all we have the Graphdb which contains the fml4.0 and ml4.0 ontology. It's used to ensure a semantic understanding among multiple servients.  

### Server
The Server is exposing a thing which in this case represents a Digital Twin connecting to the W&H4.0 Infrastructure. In this case the Digital Twin is a Raspberry Pi with a PIR motion Sensor and a RPi camera. For additional security there is a Trusted Platform Module 2.0 implemented. 

### Client
The Client Servient can be initiaded on a client device and is capable of consuming the W&H4.0 DT. It can then start a communication with the W&H4.0 DT. It can read Properties (location, status, last action), it can trigger some actions (take a picture) and listen to events (motion sensor got triggered).


### Thing Description
In order for the Server to expose the Thing it needs some Thing Description(TD). You can inspect the used TD below:

``` json
{
  "@context": [
    "https://www.w3.org/2019/wot/td/v1",
    {
      "fml40": "www.kwh-example-uri-fml40#"
    },
    {
      "@language": "en"
    }
  ],
  "@type": "fml40:ObservierungsGerät",
  "id": "W&HThingId",
  "title": "DTThing",
  "titles": {
    "en": "W&H-thing",
    "de": "W&H-ding",
    "it": "W&H-cosa"
  },
  "description": "This is an experimental kwh thing to showcase the possibilities of WoT",
  "descriptions": {
    "en": "This is an experimental kwh thing to showcase the possibilities of WoT",
    "de": "Das ist ein experimentelles Ding mit welchem die Möglichkeiten des WoT gezeigt werden können",
    "it": "Questa è una cosa sperimentale con cui si possono mostrare le possibilità di WoT"
  },
  "support": "git://github.com/eclipse/thingweb.node-wot.git",
  "securityDefinitions": {
    "nosec_sc": {
      "scheme": "nosec"
    }
  },
  "security": [
    "nosec_sc"
  ],
  "properties": {
    "movement": {
      "title": "Counting the number of animal movements detected",
      "description": "This kwh-thing includes a pir motion sensor. This field shows the number of movements which got detected",
      "unit": "",
      "type": "integer",
      "observable": true,
      "readOnly": true,
      "writeOnly": false
    },
    "location": {
      "@type": "http://www.w3.org/2003/01/geo/wgs84_pos#",
      "title": "The coordinates of the device",
      "titles": {
        "de": "Koordinaten des Gerätes",
        "it": "Coordinato del dispositivo"
      },
      "description": "These coordinates are showing the current location of the device. They get updated every 20 minutes",
      "type": "integer",
      "readOnly": true,
      "writeOnly": false,
      "observable": false
    }
  },
  "actions": {
    "takePhoto": {
      "title": "Takes img with the mounted camera",
      "description": "On this kwh-thing there is a camera attached and if invoked will take an image",
      "input": {
        "type": "object",
        "testparam": {
          "type": "string"
        }
      },
      "forms": [
        {
          "op": "invokeaction",
          "contentType": "application/json",
          "response": {
            "contentType": "image/jpg"
          }
        }
      ],
      "idempotent": false,
      "safe": false
    }
  },
  "events": {
    "movementDetected": {
      "@type": "fml40:AnimalMovement",
      "title": "Trespassing alarm",
      "description": "Event when subscribed notifies if movement gets detected from the PIR sensor",
      "data": {
        "unit": "",
        "type": "string"
      }
    }
  }
}
```
The TD is represents an invented Thing and is because of demonstration purposes fairly simple. It's based on a camera trap which could be used in a forest like environment. But it might be something more sophisticated like a Digital Twin. It contains properties such as the location of the device and how many times an animal triggered the motion sensor. As an ActionAffordance it's using a camera to trigger to do a snapshot of the environment. For   

## Raspberry Pi



## Development Setup

VS Code [RemoteDevelopment](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack)
<br>
follwing [this blogpost](https://pythononpow.medium.com/remote-development-on-a-raspberry-pi-with-ssh-and-vscode-a23388e24bc7)

- allow camera module;

- allow gpio read pins

- enable ssh

- change sudo $PATH ```VIM ~./bash``` and add :/home/pi/.nvm/versions/node/v14.15.0/bin


<br>
Example Counter<br>
start server
```
node packages/cli/dist/cli.js examples/scripts/counter.js
```
<br>
increment counter with curl
<br>
```
curl -H "Content-Type:application/json" -X POST http://127.0.0.1:8080/counter/actions/increment?step=6
```
<br>
