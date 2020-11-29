# Wald4.0_WoTDemonstrator
Semantic and WoT demonstrator for project "Forest and Wood 4.0". Contains Semantics. WoT servient. TPM2.0 scripts
<br>
**Example Counter**<br>
start server & increment counter value with curl:<br>
```
node packages/cli/dist/cli.js examples/scripts/counter.js
curl -H "Content-Type:application/json" -X POST http://127.0.0.1:8080/counter/actions/increment?step=6
```
<br>
