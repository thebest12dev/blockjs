const WebSocket = require('ws');
const fs = require("fs")
const ops = fs.readFileSync('ops.txt', 'ascii').split('\n').map(line => line.trim());


const { v4: uuidv4 } = require('uuid');
const BadWordsNext = require('bad-words-next');
const en = require('bad-words-next/data/en.json');
const filter = new BadWordsNext({ data: en });



// const pkg = require('noisejs');
// const {Noise} = pkg
// const seedrandom = require('seedrandom');

module.exports = {
    start: function(port) {
        let lastResult;


// Array of emojis
const emojis = [
    "🚀","🐟","🍉","🥕","✨"
];


// Function to get a random emoji
function getRandomEmoji() {
    const randomIndex = Math.floor(Math.random() * emojis.length);
    return emojis[randomIndex];
}

// // class Worldgen {

// // }
function findKeyByValue(obj, value) {
    for (let key in obj) {
        if (obj.hasOwnProperty(key) && obj[key] === value) {
            return key;
        }
    }
    return null; // Return null if the value is not found
}


// function getRandomInt(min, max) {
//     min = Math.ceil(min);
//     max = Math.floor(max);
//     return Math.floor(Math.random() * (max - min + 1)) + min;
// }

// // Simple function to create Perlin noise
// function generateTerrain(seed, chunkSize = 16, chunksX = 10, chunksY = 10) {
//     const noise = new Noise();
//     const rng = seedrandom(seed);
//     noise.seed(rng());

//     const chunks = [];
//     for (let chunkX = 0; chunkX < chunksX; chunkX++) {
//         chunks[chunkX] = [];
//         for (let chunkY = 0; chunkY < chunksY; chunkY++) {
//             const chunk = [];
//             for (let x = 0; x < chunkSize; x++) {
//                 for (let y = 0; y < chunkSize; y++) {
//                     const globalX = chunkX * chunkSize + x;
//                     const globalY = chunkY * chunkSize + y;
//                     const value = noise.perlin2(globalX / 50, globalY / 50);  // Scale down the coordinates

//                     const heightValue = Math.floor((value + 0.3) * 10);  // Convert to block height
//                     for (let z = 0; z < heightValue; z++) {
//                         chunk.push([x, z, y, 1, 1, 1]); // Local coordinates within the chunk
//                     }
//                 }
//             }
//             chunks[chunkX][chunkY] = chunk;
//         }
//     }
//     return chunks;
// }

// const seed = getRandomInt(1, 1000);
// let chunks = generateTerrain(seed);



// let chunks = generateTerrain();

let chunks = [

]
function generateChunk(ox,oz = 0) {
    const chunk = []
    for (let i = 0; i < 16; i++) {
        for (let j = 0; j < 16; j++) {
            chunk.push([i+ox,0,j+oz,1,1,1])
            chunk.push([i+ox,-1,j+oz,1,1,1])
            chunk.push([i+ox,-2,j+oz,1,1,1])
            chunk.push([i+ox,-3,j+oz,1,1,1])
        }
       
        
    }
    return chunk
}

// Simple chunk generation up to a point.Replace with better alternatives soon.
for (let i = 0; i < 100; i++) {
    chunks[i]= []
    for (let z= 0; z < 100; z++) {
       
        chunks[i][z] = generateChunk(16*i,16*z)
    }

    
}


let clientIds = []
let players = {}
let connections = []
let playerData = {}

const server = new WebSocket.Server({ port:port});

server.on('connection', (socket) => {

    connections.push(socket)
    // Respond to messages from the client
    socket.on('message', (message) => {
        let json;
        try {
             json = JSON.parse(message.toString())
        } catch {
            console.error(`❌ ID ${socket.clientId} sent malformed data (Error code 400)`)
            socket.send(`{"type": "error", "status": 400, "reason": "malformedJSON"}`)
            return
        }
        
        switch (json.type) {
            case "echo":
                const clientId = uuidv4();
                clientIds.push(clientId);
                socket.clientId = clientId
                playerData[clientId] = {}
                console.log(`${getRandomEmoji()} A player with ID ${clientId} has connected to the server`);
                socket.send(`{"type":"echoSuccess","status":200,"clientId": "${clientId}"}`);

                break
            case "getWorldData":
                    let chunk = json.chunk
                    let result
                    try {
                         result = {
                            type: "terrainResult",
                            data: chunks[chunk[0]][chunk[1]]
                        };
                    } catch {
                        console.error(`❌ ID ${socket.clientId} sent invalid arguments (Error code 400)`)
                        socket.send(`{"type": "error", "status": 400, "reason": "invalidArgs"}`)
                    }
                    
                
                    // Check if objects have changed
                   //if (JSON.stringify(objects) !== JSON.stringify(lastResult?.data)) {
                        socket.send(JSON.stringify(result));
                  //  }
                    break;
                

            case "disconnect":
                if (clientIds.includes(socket.clientId)) {
                    console.log(`${getRandomEmoji()} A player with ID ${socket.clientId} has disconnected from the server`);
                    clientIds.splice( clientIds.findIndex(() => {}, socket.clientId),1)
                    players[socket.clientId] = undefined;
                    playerData[socket.clientId] = undefined
                } else {
                    console.log(`❌ An invalid player with ID ${socket.clientId} tried to disconnect from the server`);
                }
                break
            case "playerSet":
                if (players[socket.clientId] !== undefined) {
                    console.log(`❌ Player name already set for ID ${socket.clientId} `)
                    socket.send(`{"type": "error", "status":400, "reason": "playerNameAlreadySet"}`)
                } else if (!clientIds.includes(socket.clientId)) {
                    console.log(`❌ ID ${socket.clientId} does not exist for player name ${json.playerName}`)
                    socket.send(`{"type": "error", "status":400, "reason": "idNotFound"}`)
                } else {
                    players[socket.clientId] = json.playerName 
                    console.log(`${getRandomEmoji()} Set player name '${json.playerName}' for ID ${socket.clientId}`)
                    socket.send(`{"type": "playerSetSuccess", "status":200}`)
                }
                break;
            case "chatSend":
                let playerName = socket.clientId
                        if (players[socket.clientId] !== undefined) {
                            playerName = players[socket.clientId]
                        }
                console.log(`💬 ${playerName}: ${json.message}`)
                if (json.message.startsWith("/")) {
                    if (json.message.startsWith("/kick ")) {
                        if (ops.includes(playerName)) {
                            let playerToKick = json.message.substring("/kick ".length)
                        let playerIdToKick = findKeyByValue(players, playerToKick)
                        players[playerIdToKick] = undefined
                        clientIds.splice(clientIds.findIndex(() => {},playerIdToKick),1)
                        console.log(`🚫 Player '${playerToKick}' has been kicked by '${players[socket.clientId]}'`)
                        connections.forEach((val) => {
                            if (val.clientId == playerIdToKick) {
                                val.send(`{"type": "error", "status": 403, "reason": "playerKick", "playerKickedBy": "${players[socket.clientId]}"}`)
                            }
                        })
                        } else {
                            console.log(`🚫 Player '${players[socket.clientId]}' does not have privileges to kick!`)
                        }
                        
                    }
                } else {
                    connections.forEach(element => {
                        element.send(`{"type": "chatReceive", "playerName": "${playerName}", "message": "${filter.filter(json.message)}"}`)
                    });
                }
                
                break
                case "position":
                    playerData[socket.clientId].position = json.position
                    break;
        }
        
    });
    

    // Handle client disconnection
    socket.on('close', () => {
        console.log(`${getRandomEmoji()} A player with ID ${socket.clientId} has abruptly disconnected from the server`);
        connections.splice(connections.findIndex(() => {}, socket),1)
        clientIds.splice(clientIds.findIndex(() => {}, socket.clientId),1)
        players[socket.clientId] = undefined
    });
});

setInterval(() => {
    connections.forEach((value_) => {
        connections.forEach((value) => {
            if (value !== value_ && playerData[value_.clientId] !== undefined) {
                if (playerData[value_.clientId].position !== undefined) {
                    value.send(`{"type": "positionGet", "player": "${players[value_.clientId]}", "position": [${playerData[value_.clientId].position[0]},${playerData[value_.clientId].position[1]},${playerData[value_.clientId].position[2]}]}`)
                }
               
            }
          
        })
    })
   
},100)
console.log('Game WebSocket Server v1.0.0');
console.log('✅ The server is running on ws://localhost:'+port);
    }
}
