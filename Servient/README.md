# Exposed Thing with node-wot as Dependency

In the scope of my work this servient was running on a Raspberry Pi (RPi). Since the servient uses nodejs, its usage is not limited on RPi. To adapt it though the handlers using specific RPi libraries must be exchanged or adapted.


## Development Setup
I used remote development to interact with my RPi.

VS Code [RemoteDevelopment](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack)
<br>
follwing [this blogpost](https://pythononpow.medium.com/remote-development-on-a-raspberry-pi-with-ssh-and-vscode-a23388e24bc7)

### Raspberry pi camera
It's easy. Just follow the link to the official introduction [here](https://projects.raspberrypi.org/en/projects/getting-started-with-picamera)

### Pir motion sensor
Also for the motion sensor there is an official tutorial. You can find it [here](https://projects.raspberrypi.org/en/projects/parent-detector/1)

## To run the project:
- Get dependencies
```
npm install
```
- compile ts 
```
npm run build
```
- you need to use sudo to get acces for the GPIOs. You might need to export nodejs PATH.
```
echo $Path
'copy path to node'
sudo su
export PATH="$PATH[exported path to node]"
```
- start Servient
```
node index.js
```