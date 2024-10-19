import path from 'path'
import { WgConfig } from "wireguard-tools"
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const serverPrivateKey = execSync('wg genkey').toString().trim();
const serverPublicKey = execSync(`echo ${serverPrivateKey} | wg pubkey`).toString().trim();

// Generate private and public keys for the peer
const peerPrivateKey = execSync('wg genkey').toString().trim();
const peerPublicKey = execSync(`echo ${peerPrivateKey} | wg pubkey`).toString().trim();


const filePath = path.join(__dirname, '/configs', '/tanvir.conf')

const config1 = new WgConfig({
    wgInterface: {
        address: ['10.0.0.1/24'], // Define the address for the WireGuard interface
        privateKey: serverPrivateKey,
        listenPort: 51820, // Default WireGuard port
    },
    peers: [
        {
            publicKey: peerPublicKey,
            allowedIps: ['10.0.0.2/32'], // Allowed IP ranges for this peer
        },
    ],
    filePath: filePath
});





export { config1 };