import path from 'path'
import { WgConfig, createPeerPairs } from "wireguard-tools"
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import { execSync, exec } from 'child_process';

const wireguardDir = '/etc/wireguard/';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);


async function generateServerKey() {
    const serverPrivateKey = execSync('wg genkey').toString().trim();
    const serverPublicKey = execSync(`echo ${serverPrivateKey} | wg pubkey`).toString().trim();
    // const clientPrivateKey = execSync('wg genkey').toString().trim();
    // const clientPublicKey = execSync(`echo ${clientPrivateKey} | wg pubkey`).toString().trim();

    // Save keys
    fs.writeFileSync(path.join(wireguardDir, 'server-private.key'), serverPrivateKey);
    fs.writeFileSync(path.join(wireguardDir, 'server-public.key'), serverPublicKey);
}


// const serverPrivateKey = execSync('wg genkey').toString().trim();
// const serverPublicKey = execSync(`echo ${serverPrivateKey} | wg pubkey`).toString().trim();
// // const clientPrivateKey = execSync('wg genkey').toString().trim();
// // const clientPublicKey = execSync(`echo ${clientPrivateKey} | wg pubkey`).toString().trim();

// // Save keys
// fs.writeFileSync(path.join(wireguardDir, 'server-private.key'), serverPrivateKey);
// fs.writeFileSync(path.join(wireguardDir, 'server-public.key'), serverPublicKey);
// fs.writeFileSync(path.join(wireguardDir, 'client-private.key'), clientPrivateKey);
// fs.writeFileSync(path.join(wireguardDir, 'client-public.key'), clientPublicKey);


var useIpList = []


const serverConfPath = path.join(wireguardDir, 'wg0.conf');
const clientConfPath = path.join(wireguardDir, 'client.conf');

// Server configuration
async function NewServerCreate() {
    generateServerKey()
    const serverPrivateKey = fs.readFileSync(path.join(wireguardDir, 'server-private.key'), "utf-8")

    const wg0Conf = `
[Interface]
Address = 10.8.0.1/32
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
    NewServerCreate()
    const totalProfile = parseInt(req.query.profile)

    for (let index = 0; index < totalProfile; index++) {
        const clientIP = generateClientIP((index + 1));
        const clientPrivateKey1 = execSync('wg genkey').toString().trim();
        const clientPublicKey1 = execSync(`echo ${clientPrivateKey1} | wg pubkey`).toString().trim();
        const clientConfPath = path.join(wireguardDir, `client-${clientIP}.conf`);

        const serverPublicKey = fs.readFileSync(path.join(wireguardDir, 'server-public.key'), "utf-8")
        const host = req.get('host');
        const peers = extractAllowedIPs(serverConfPath);
        //const clientIP = `10.8.0.${peers.length + 2}/32`; // Adjust IP logic as needed

        // Append new peer (client) to the server's wg0.conf file
        const peerConfig = `
[Peer]
PublicKey = ${clientPublicKey1}
AllowedIPs = ${clientIP}/32
`;

        fs.appendFileSync(serverConfPath, peerConfig);

        //   Generate client configuration file (client.conf)

        const clientConf = `
[Interface]
PrivateKey = ${clientPrivateKey1}
Address = ${clientIP}/32
DNS = 1.1.1.1

[Peer]
PublicKey = ${serverPublicKey}
Endpoint = ${host}:51820
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25
`;



        fs.writeFileSync(clientConfPath, clientConf);

    }





    exec('sudo systemctl restart wg-quick@wg0.service', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error restarting WireGuard service: ${error.message}`);
            return res.status(500).json({ error: 'Failed to restart WireGuard service' });
        }

        res.send("all client create successfull and restart server");
    });



}

function generateClientIP(clientIndex) {
    const baseIP = '10.8'; // The base IP block (can be modified)
    const subnet = Math.floor(clientIndex / 254); // Move to the next subnet after 254 clients
    const host = (clientIndex % 254) + 1; // Increment host address from 1 to 254
    return `${baseIP}.${subnet}.${host}`;
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



function getWireGuardPeers(req, res) {
    exec('wg show', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing wg show: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Error: ${stderr}`);
            return;
        }

        // Parse the output
        const output = stdout;
        const interfaces = parseWireGuardOutput(output);
        res.json(interfaces)
    });
}

// Function to parse the output of wg show
function parseWireGuardOutput(output) {
    const interfaces = {};
    const lines = output.split('\n');
    const thirtyMinutesAgo = Date.now() - 1 * 60 * 1000; // 30 minutes in milliseconds
    let currentInterface = null;

    lines.forEach(line => {
        // Check if it's an interface
        const interfaceMatch = line.match(/^interface: (\S+)/);
        if (interfaceMatch) {
            currentInterface = interfaceMatch[1];
            interfaces[currentInterface] = { peers: [] };
        }

        // Check for peer
        const peerMatch = line.match(/^peer: (\S+)/);
        if (peerMatch && currentInterface) {
            interfaces[currentInterface].peers.push({ publicKey: peerMatch[1] });
        }

        const allowedIpsMatch = line.match(/allowed ips: (.+)/);
        if (allowedIpsMatch && currentInterface) {
            const lastPeer = interfaces[currentInterface].peers[interfaces[currentInterface].peers.length - 1];
            if (lastPeer) {

                lastPeer.allowedIps = allowedIpsMatch[1];
            }
            // const ip = allowedIpsMatch[1]
            // interfaces[currentInterface].peers.push({ allowedIps: allowedIpsMatch[1] });
            // const ipWithoutSubnet = ip.split('/')[0];
            // var config = fs.readFileSync(path.join(wireguardDir, `client-${ipWithoutSubnet}.conf`), "utf-8")
            // interfaces[currentInterface].peers.push({ config: JSON.stringify(config) });
        }

        if (allowedIpsMatch && currentInterface) {
            const lastPeer = interfaces[currentInterface].peers[interfaces[currentInterface].peers.length - 1];
            if (lastPeer) {
                const ip = allowedIpsMatch[1]
                const ipWithoutSubnet = ip.split('/')[0];
                var config = fs.readFileSync(path.join(wireguardDir, `client-${ipWithoutSubnet}.conf`), "utf-8")
                lastPeer.config = config;
            }
        }




        // Check for latest handshake
        const handshakeMatch = line.match(/latest handshake: (.+)/);
        console.log(handshakeMatch)
        if (handshakeMatch && currentInterface) {
            const latestHandshake = parseHandshakeTime(handshakeMatch[1]);
            const lastPeer = interfaces[currentInterface].peers[interfaces[currentInterface].peers.length - 1];
            if (lastPeer && latestHandshake && latestHandshake < thirtyMinutesAgo) {
                lastPeer.latestHandshake = handshakeMatch[1];
                lastPeer.inactive = true; // Mark as inactive
            }
        } else if (handshakeMatch == null && currentInterface) {
            const lastPeer = interfaces[currentInterface].peers[interfaces[currentInterface].peers.length - 1];
            if (lastPeer) {
                lastPeer.inactive = true;
            }

        }
    });


    // Filter only inactive peers
    const inactivePeers = {};
    for (let iface in interfaces) {
        inactivePeers[iface] = interfaces[iface].peers.filter(peer => peer.inactive);
    }

    return inactivePeers;
}

// Function to parse handshake time from 'wg show' output
function parseHandshakeTime(handshakeStr) {
    const now = Date.now();

    if (handshakeStr.includes('minute')) {
        const minutesAgo = parseInt(handshakeStr.match(/(\d+) minute/)[1], 10);
        return now - minutesAgo * 60 * 1000; // Convert to milliseconds
    }

    if (handshakeStr.includes('hour')) {
        const hoursAgo = parseInt(handshakeStr.match(/(\d+) hour/)[1], 10);
        return now - hoursAgo * 60 * 60 * 1000; // Convert to milliseconds
    }

    // Handle more cases (e.g., days ago, seconds ago) if needed

    return null;
}

async function singleClientProfile(req, res) {
    var config = fs.readFileSync(path.join(wireguardDir, `client-${req.query.ip}.conf`), "utf-8")
    res.send(config)
}


export {
    NewServerCreate, ServerRun, ClientRun, serverDown, journalctl, NewClientCreate, serverConf,
    clientConf, getWireGuardPeers, singleClientProfile
};