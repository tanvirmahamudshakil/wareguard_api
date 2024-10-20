import path from 'path'
import { WgConfig, createPeerPairs } from "wireguard-tools"
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import { execSync, exec } from 'child_process';

const wireguardDir = '/etc/wireguard/';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);


const serverPrivateKey = execSync('wg genkey').toString().trim();
const serverPublicKey = execSync(`echo ${serverPrivateKey} | wg pubkey`).toString().trim();
// const clientPrivateKey = execSync('wg genkey').toString().trim();
// const clientPublicKey = execSync(`echo ${clientPrivateKey} | wg pubkey`).toString().trim();

// Save keys
fs.writeFileSync(path.join(wireguardDir, 'server-private.key'), serverPrivateKey);
fs.writeFileSync(path.join(wireguardDir, 'server-public.key'), serverPublicKey);
// fs.writeFileSync(path.join(wireguardDir, 'client-private.key'), clientPrivateKey);
// fs.writeFileSync(path.join(wireguardDir, 'client-public.key'), clientPublicKey);


var useIpList = []


const serverConfPath = path.join(wireguardDir, 'wg0.conf');
const clientConfPath = path.join(wireguardDir, 'client.conf');

// Server configuration
async function NewServerCreate() {
    const wg0Conf = `
[Interface]
Address = 10.8.0.1/24
PrivateKey = ${serverPrivateKey}
PostUp = ufw route allow in on wg0 out on eth0
PostUp = iptables -t nat -I POSTROUTING -o eth0 -j MASQUERADE
PreDown = ufw route delete allow in on wg0 out on eth0
PreDown = iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE
ListenPort = 51820
`;

    fs.writeFileSync(serverConfPath, wg0Conf);
    execSync(`sudo chmod 600 ${serverConfPath}`)
    return fs.readFileSync(`${serverConfPath}`, 'utf8')
}


async function serverConf() {
    return fs.readFileSync(`${serverConfPath}`, 'utf8')
}

async function clientConf() {
    return fs.readFileSync(`${clientConfPath}`, 'utf8')
}


// // Client configuration
// async function ClientConfigure() {
//     const clientConf =
// `[Interface]
// Address = 10.8.0.2/24
// PrivateKey = ${clientPrivateKey}
// DNS = 1.1.1.1

// [Peer]
// PublicKey = ${serverPublicKey}
// Endpoint = 143.110.176.147:51820
// AllowedIPs = 0.0.0.0/0
// PersistentKeepalive = 15
// `;

//     useIpList.push("10.8.0.2")
//     fs.writeFileSync(clientConfPath, clientConf);
//     return fs.readFileSync(`${clientConfPath}`, 'utf8')
// }



function journalctl() {


    exec('sudo ufw allow 51820/udp', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Standard Error: ${stderr}`);
            return;
        }
        console.log(`WireGuard ufw Logs:${stdout}`);
    });

    exec('sudo ufw reload', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Standard Error: ${stderr}`);
            return;
        }
        console.log(`WireGuard Service Logs:${stdout}`);
    });

    exec("echo net.ipv4.ip_forward = 1 | sudo tee -a /etc/sysctl.conf", (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Standard Error: ${stderr}`);
            return;
        }
        console.log(`WireGuard Service Logs:${stdout}`);
    });

    exec("sudo iptables -t nat -A POSTROUTING -s 10.0.0.0/24 -o eth0 -j MASQUERADE", (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Standard Error: ${stderr}`);
            return;
        }
        console.log(`WireGuard Service Logs:${stdout}`);
    });

    exec("sudo iptables-save | sudo tee /etc/iptables/rules.v4", (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Standard Error: ${stderr}`);
            return;
        }
        console.log(`WireGuard Service Logs:${stdout}`);
    });
}


function ServerRun() {
    exec('sudo systemctl start wg-quick@wg0.service', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error starting WireGuard service: ${error.message}`);
            return;
        }

        if (stderr) {
            console.error(`WireGuard service stderr: ${stderr}`);
            return;
        }

        console.log(`WireGuard service started successfully: ${stdout}`);
    });
}


function serverDown() {
    exec('sudo systemctl stop wg-quick@wg0.service', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error stoping WireGuard service: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`WireGuard service stderr: ${stderr}`);
            return;
        }
        console.log(`WireGuard service stop successfully: ${stdout}`);
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



function NewClientCreate(req, res) {
    const clientPrivateKey1 = execSync('wg genkey').toString().trim();
    const clientPublicKey1 = execSync(`echo ${clientPrivateKey1} | wg pubkey`).toString().trim();
    const clientConfPath = path.join(wireguardDir, `client-${req.query.userid}.conf`);
    const clientExit = fs.existsSync(clientConfPath)
    const host = req.get('host');
    if (clientExit) {
        const clientconf = fs.readFileSync(clientConfPath, 'utf8')
        res.send(clientconf)
         
    } else {
        const peers = extractAllowedIPs(serverConfPath);
        const clientIP = `10.0.0.${peers.length + 2}/24`; // Adjust IP logic as needed

        // Append new peer (client) to the server's wg0.conf file
        const peerConfig = `
[Peer]
PublicKey = ${clientPublicKey1}
AllowedIPs = ${clientIP}
`;

        fs.appendFileSync(serverConfPath, peerConfig);




        //   Generate client configuration file (client.conf)
        const serverPublicKey = getServerPublicKey(); // Retrieve the server's public key
        const clientConf = `
[Interface]
PrivateKey = ${clientPrivateKey1}
Address = ${clientIP}
DNS = 1.1.1.1

[Peer]
PublicKey = ${serverPublicKey}
Endpoint = ${host}:51820
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25
`;



        fs.writeFileSync(clientConfPath, clientConf);
        res.send(clientConf);

        // exec('sudo systemctl restart wg-quick@wg0.service', (error, stdout, stderr) => {
        //     if (error) {
        //         console.error(`Error restarting WireGuard service: ${error.message}`);
        //         return res.status(500).json({ error: 'Failed to restart WireGuard service' });
        //     }

        //     res.send(clientConf);
        // });
    }



}





const extractAllowedIPs = (configFile) => {
    const fileData = fs.readFileSync(configFile, 'utf8');
    const lines = fileData.split('\n');

    let peers = [];
    let peerInfo = null;

    lines.forEach((line) => {
        line = line.trim();

        if (line.startsWith('[Peer]')) {
            // If we encounter a new peer block, store the current one and start a new one
            if (peerInfo) peers.push(peerInfo);
            peerInfo = {};
        }

        if (line.startsWith('AllowedIPs')) {
            // Extract AllowedIPs for the current peer
            const allowedIPs = line.split('=')[1].trim();
            peerInfo.AllowedIPs = allowedIPs;
        }
    });

    // Push the last peer block
    if (peerInfo) peers.push(peerInfo);

    return peers;
};

// Call the function and log the result

// peers.forEach((peer, index) => {
//     console.log(`Peer ${index + 1}: AllowedIPs = ${peer.AllowedIPs}`);
// });

// Function to get the server's public key
function getServerPublicKey() {
    const serverPrivateKey = fs.readFileSync(path.join(wireguardDir, 'server-private.key'), 'utf-8').trim();
    return execSync(`echo ${serverPrivateKey} | wg pubkey`).toString().trim();
}



export {
    NewServerCreate, ServerRun, ClientRun, serverDown, journalctl, NewClientCreate, serverConf,
    clientConf
};