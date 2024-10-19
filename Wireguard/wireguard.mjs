import path from 'path'
import { WgConfig } from "wireguard-tools" 
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const filePath = path.join(__dirname, '/configs', '/guardline-server.conf')

const config1 = new WgConfig({
    wgInterface: { address: ['10.10.1.1'] },
    filePath
})




export { config1 };