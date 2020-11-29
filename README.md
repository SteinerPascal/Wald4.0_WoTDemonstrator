# Exposed Thing with node-wot as Dependency


## Raspberry Pi

## Development Setup

VS Code [RemoteDevelopment](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack)
<br>
follwing [this blogpost](https://pythononpow.medium.com/remote-development-on-a-raspberry-pi-with-ssh-and-vscode-a23388e24bc7)

<br>
**Example Counter**<br>
start server & increment counter value with curl:<br>
```
node packages/cli/dist/cli.js examples/scripts/counter.js
curl -H "Content-Type:application/json" -X POST http://127.0.0.1:8080/counter/actions/increment?step=6
```
<br>