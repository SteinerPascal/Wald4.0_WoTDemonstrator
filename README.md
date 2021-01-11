# Exposing and consuming Things for a PoC in context of Digital Twins and [Wald & Holz 4.0](https://www.kwh40.de/)

This Repo contains a PoC to use WoT with digital twins. It's more a demonstration of the WoT technology then including it in the Wald & Holz Infrastracture. 
It was developed in the context of a semester work to show capabilities of WoT and Web semanic in Digital Twins and Digital Twin infrastructure. 

## Architecture

Above you can see the Archtiecture. The whole thing consists of two Eclipse [thingweb](https://github.com/eclipse/thingweb.node-wot/) Servients connected with each other. The right Servient takes on the role of a server and the left one takes on the role of a client. 

### Server
The Server is exposing a thing which in this case represents a Digital Twin connecting to the W&H4.0 Infrastructure. In this case the Digital Twin is a Raspberry Pi with a PIR motion Sensor and a RPi camera. For additional security there is a Trusted Platform Module 2.0 implemented. 

### Client
The Client Servient can be initiaded on a client device and is capable of consuming the W&H4.0 DT. It can then start a communication with the W&H4.0 DT. It can read Properties (location, status, last action), it can trigger some actions (take a picture) and listen to events (motion sensor got triggered).


### Thing Description
In order for the Server to expose the Thing it needs some Thing Description:



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
