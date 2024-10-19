import path from 'path'
import { WgConfig, createPeerPairs } from "wireguard-tools"
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


createPeerPairs({
    config: config1,
    peerSettings: ({ thisConfig, peerConfig }) => {
        const peerAddress = peerConfig.wgInterface.address
        const peerPresharedKey = peerConfig.preSharedKey
        return {
            allowedIps: peerAddress,
            preSharedKey: peerPresharedKey,
            name: peerConfig.wgInterface.name,
            persistentKeepalive: thisConfig.wgInterface.address.includes('10.10.1.1') ? 25 : undefined
        }
    }
})


export { config1 };