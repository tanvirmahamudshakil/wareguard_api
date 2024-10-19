import path from 'path'
import { WgConfig, createPeerPairs } from "wireguard-tools"
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import { execSync, exec } from 'child_process';

const wireguardDir = '/etc/wireguard/';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const serverPrivateKey = execSync('wg genkey').toString().trim();
const serverPublicKey = execSync(`echo ${serverPrivateKey} | wg pubkey`).toString().trim();
const clientPrivateKey = execSync('wg genkey').toString().trim();
const clientPublicKey = execSync(`echo ${clientPrivateKey} | wg pubkey`).toString().trim();

// Save keys
fs.writeFileSync(path.join(wireguardDir, 'server-private.key'), serverPrivateKey);
fs.writeFileSync(path.join(wireguardDir, 'server-public.key'), serverPublicKey);
fs.writeFileSync(path.join(wireguardDir, 'client-private.key'), clientPrivateKey);
fs.writeFileSync(path.join(wireguardDir, 'client-public.key'), clientPublicKey);




const serverConfPath = path.join(wireguardDir, 'wg0.conf');
const clientConfPath = path.join(wireguardDir, 'client.conf');

// Server configuration
async function ServerConfiger() {

    // const serverConfig = new WgConfig({
    //     wgInterface: {
    //         address: ['10.0.0.1/24'],
    //         privateKey: serverPrivateKey,
    //         listenPort: 51820,
    //         dns: ['1.1.1.1'],
    //         PostUp: "ufw route allow in on wg0 out on eth0",
    //         PostUp: "iptables - t nat - I POSTROUTING - o eth0 - j MASQUERADE",
    //         PreDown: "ufw route delete allow in on wg0 out on eth0",
    //         PreDown: "iptables - t nat - D POSTROUTING - o eth0 - j MASQUERADE",
    //     },
    //     peers: [
    //         {
    //             publicKey: clientPublicKey,
    //             allowedIps: ['10.0.0.2/32'],
    //         },
    //     ],
    // });
    // fs.writeFileSync(serverConfPath, serverConfig.toString());
    const wg0Conf = `
[Interface]
Address = 10.8.0.1/24
PrivateKey = ${serverPrivateKey}
PostUp = ufw route allow in on wg0 out on eth0
PostUp = iptables -t nat -I POSTROUTING -o eth0 -j MASQUERADE
PreDown = ufw route delete allow in on wg0 out on eth0
PreDown = iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE
ListenPort = 51820

[Peer]
PublicKey = ${clientPublicKey}
AllowedIPs = 10.8.0.2/32
`;

    fs.writeFileSync(serverConfPath, wg0Conf);
    execSync(`echo chmod 600 ${serverConfPath}`)

    return fs.readFileSync(`${serverConfPath}`, 'utf8')
}


// Client configuration
async function ClientConfigure() {

    // const clientConfig = new WgConfig({
    //     wgInterface: {
    //         address: ['10.0.0.2/24'],
    //         privateKey: clientPrivateKey,
    //         dns: ['1.1.1.1'],
    //     },
    //     peers: [
    //         {
    //             publicKey: serverPublicKey,
    //             allowedIps: ['0.0.0.0/0'],
    //             endpoint: '143.110.176.147:51820',
    //         },
    //     ],
    // });
    // fs.writeFileSync(clientConfPath, clientConfig.toString());

    const clientConf = `
[Interface]
Address = 10.8.0.2/24
PrivateKey = ${clientPrivateKey}
DNS = 1.1.1.1

[Peer]
PublicKey = ${serverPublicKey}
Endpoint = 143.110.176.147:51820
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 15
`;

    fs.writeFileSync(clientConfPath, clientConf);
    return fs.readFileSync(`${clientConfPath}`, 'utf8')
}



function journalctl() {
    exec('sudo journalctl -u wg-quick@wg0.service', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Standard Error: ${stderr}`);
            return;
        }
        console.log(`WireGuard Service Logs:\n${stdout}`);
    });

    exec('sudo ufw allow 22 && sudo ufw enable -y', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Standard Error: ${stderr}`);
            return;
        }
        console.log(`WireGuard Service Logs:\n${stdout}`);
    });

    exec('sudo ufw allow 51820/udp', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Standard Error: ${stderr}`);
            return;
        }
        console.log(`WireGuard Service Logs:\n${stdout}`);
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
        console.log(`WireGuard Service Logs:\n${stdout}`);
    });

    exec("echo 'net.ipv4.ip_forward = 1' | sudo tee -a /etc/sysctl.conf", (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Standard Error: ${stderr}`);
            return;
        }
        console.log(`WireGuard Service Logs:\n${stdout}`);
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
        console.log(`WireGuard Service Logs:\n${stdout}`);
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
        console.log(`WireGuard Service Logs:\n${stdout}`);
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


export { ServerConfiger, ClientConfigure, ServerRun, ClientRun, serverDown, journalctl };