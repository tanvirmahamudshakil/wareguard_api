import path from 'path'
import { WgConfig, createPeerPairs } from "wireguard-tools"
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import { execSync, exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const serverPrivateKey = execSync('wg genkey').toString().trim();
const serverPublicKey = execSync(`echo ${serverPrivateKey} | wg pubkey`).toString().trim();
const clientPrivateKey = execSync('wg genkey').toString().trim();
const clientPublicKey = execSync(`echo ${clientPrivateKey} | wg pubkey`).toString().trim();

// Save keys
fs.writeFileSync(path.join(__dirname, 'server-private.key'), serverPrivateKey);
fs.writeFileSync(path.join(__dirname, 'client-private.key'), clientPrivateKey);



// Server configuration
async function ServerConfiger() {
    const serverConfPath = path.join(__dirname, 'wg0.conf');
    const serverConfig = new WgConfig({
        wgInterface: {
            address: ['10.0.0.1/24'],
            privateKey: serverPrivateKey,
            listenPort: 51820,
            dns: ['1.1.1.1'],
        },
        peers: [
            {
                publicKey: clientPublicKey,
                allowedIps: ['10.0.0.2/32'],
            },
        ],
    });
    fs.writeFileSync(serverConfPath, serverConfig.toString());
}


// Client configuration
async function ClientConfigure() {
    const clientConfPath = path.join(__dirname, 'client.conf');
    const clientConfig = new WgConfig({
        wgInterface: {
            address: ['10.0.0.2/24'],
            privateKey: clientPrivateKey,
            dns: ['1.1.1.1'],
        },
        peers: [
            {
                publicKey: serverPublicKey,
                allowedIps: ['0.0.0.0/0'],
                endpoint: '143.110.176.147:51820',
            },
        ],
    });
    fs.writeFileSync(clientConfPath, clientConfig.toString());
}



function ServerRun() {
    exec(`wg-quick up ${serverConfPath}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Server error: ${error.message}`);
        }
        console.log(`Server started:\n${stdout}`);
    });
}




function ClientRun() {
    exec(`wg-quick up ${clientConfPath}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Client error: ${error.message}`);
        }
        console.log(`Client started:\n${stdout}`);
    });
}


export { ServerConfiger, ClientConfigure, ServerRun, ClientRun };