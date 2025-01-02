import { Output } from "./logger"
import { Block } from "./block"
import { Renderer } from "./renderer"
let listeners: ((data: any) => void)[] = []
let chatListener: ((message: string, player: string) => any) = null
let ws: WebSocket = null
export class NetworkingAPIContext {
    public static getIntegratedServer() {
        return new IntegratedServer()
    }
    public static addOnMessageListener(listener: (data: any) => void, id: string) {
        listeners.push(listener)
    }
    public static removeOnMessageListener(listener: (data: any) => void, id: string) {
        listeners = listeners.filter((element) => element !== listener)
    }
    public static chat(message: string) {
        ws.send(`{"type":"chatSend", "message": "${message}"}`);
    }
    public static closeWebSocket() {
        ws.close()
    }
    setOnChatListener(listener: (message: string, player: string) => any) {
        setTimeout(() => {
            chatListener = listener
        }, 50);
        
    }
    clearOnChatListener() {
        chatListener = null
    }

}
    export class Connection {
    #conn: WebSocket | IntegratedServer;
    #onJoinListener = () => {}
    #isConnected = false;
    #pendingChunks = new Map();
    #onChatHandler: (a: any,b:any) => {}

    constructor(webSocketUrlOrIntegratedServer: string | URL | IntegratedServer,playerName:string) {
       if (typeof webSocketUrlOrIntegratedServer === 'object') {
        try {
            this.#conn = webSocketUrlOrIntegratedServer as IntegratedServer
        } catch (error) {
            console.error(error)
        }
       } else {
        this.#conn = new WebSocket(webSocketUrlOrIntegratedServer as string)
       }
           
        
        
        
        
        this.#conn.onopen = () => {
            this.#conn.send(`{"type":"echo"}`);
            Output.log("Echoing the server...", "Client");
            let i = setInterval(() => {
                if (this.#conn.readyState !== this.#conn.OPEN) {
                    clearInterval(i)
                } else {
                    this.#conn.send(`{"type":"position", "position": [${Renderer.getRenderer().camera.position[0]},${Renderer.getRenderer().camera.position[1]},${Renderer.getRenderer().camera.position[2]}]}`);
                }
            }, 100);
        };
        const playerBlocks: any = {}
        ws = this.#conn as WebSocket
        this.#conn.onmessage = (event: { data: string; }) => {
            
            let data: any;
            try {
                data = JSON.parse(event.data);
                listeners.forEach(element => {
                    element(data);
                });
            } catch {
                return
            }
            if (data.type === "echoSuccess") {
                
                Output.log("Join success, setting player name...", "Client");
                this.#isConnected = true;
                this.#conn.send(`{"type":"playerSet","playerName":"${playerName}"}`);
                Output.log(`Using player name '${playerName}'`, webSocketUrlOrIntegratedServer.toString());
                this.#onJoinListener()
                // Handle initial success logic if needed
            } else if (data.type === "terrainResult") {
                
                document.getElementById("titleScreen").setAttribute("_2","")
                document.getElementById("multiplayerScreen").setAttribute("_2","")
                document.getElementById("game").removeAttribute("_2")
                document.getElementById("glCanvas").removeAttribute("_2")
                data.data.forEach((element: any[]) => {
                    new Block(element[0], element[1],element[2],element[3],element[4],element[5])
                });
            } else if (data.type === "chatReceive") {
                chatListener(data.message,data.playerName)
                this.#onChatHandler(data.playerName,data.message)
            } else if (data.type === "positionGet") {
            
                if (playerBlocks[data.player] === undefined) {
                    playerBlocks[data.player] = new  Block(data.position[0],data.position[1]-0.5,data.position[2],1,2,1)
                } else {
                    playerBlocks[data.player].position = [data.position[0],data.position[1]-0.5,data.position[2]]
                }
            } else if (data.type === "error") {
                if (data.reason == "playerKick") {
                   document.getElementById("glCanvas").setAttribute("_2","");
                   document.getElementById("game").setAttribute("_2","");
                   document.getElementById("fpsCount").setAttribute("_2","");
                   (window as any).objects = []
                  
                   document.getElementById("multiplayerErrorScreen").removeAttribute("_2")
                   document.getElementById("connectionLostReason").innerHTML = "You have been kicked by "+data.playerKickedBy+"."

                }
            }
            //             //  document.getElementById("glCanvas").removeAttribute("_2")
//             //  document.getElementById("game").removeAttribute("_2")
//             //      document.getElementById("multiplayerScreen").setAttribute("_2","")
//             //       document.getElementById("titleScreen").setAttribute("_2","")
//             //      data.data.forEach(element => {
//             //          new BlockJS.Block(element[0], element[1],element[2],element[3],element[4],element[5])
//             //      });
             
                // Handle other message types here
        };

        this.#conn.onerror = (error: any) => {
            
            console.error("WebSocket Error: ", error);
        };

        this.#conn.onclose = () => {
            this.#isConnected = false;
            console.log("WebSocket closed.");
        };
    }

    chat(message: any) {
        this.#conn.send(`{"type":"chatSend", "message": "${message}"}`);
    }

    requestChunkAndRender(cx: any, cz: any) {
     Output.log(`Requesting chunk at coordinates ${cx}, ${cz}...`, this.#conn.url);
     this.#conn.send(`{"type":"getWorldData", "chunk": [${cx}, ${cz}]}`);

    }
    setChatReceiveListener(listener: (message: string, playerOrClientId: string) => {}) {
        this.#onChatHandler = listener
    }
    setOnJoinListener(listener: () => {}) {
        this.#onJoinListener = listener
    }
}
let currentIntegrated: IntegratedServer = null
export class IntegratedServer {
    private players: any = {}
    private  socketClientId = "integrated"
    public OPEN: number = 3;
    public readyState: number = this.OPEN;
    public onopen: () => void = () => {}
    constructor() {
        currentIntegrated = this
        setTimeout(() => {
            this.onopen()
        }, 50);
       
    }
    
    public onmessage: (e: {data: any} | Event) => void
    public onerror: (e: any) => void 
    public onclose: () => void 
    
    public send(message: any) {
                // Array of emojis
                let chunks = [

                ]
                function generateChunk(ox: any,oz = 0) {
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
                chunks[0]= []
                chunks[0][0] = generateChunk(16*1)
                chunks[0][1] = generateChunk(16*2)
                chunks[0][2] = generateChunk(16*3)
                chunks[0][3] = generateChunk(16*4)
                chunks[0][4] = generateChunk(16*5)
                chunks[1]= []
                chunks[1][0] = generateChunk(16*1,16*1)
                chunks[1][1]= generateChunk(16*2,16*1)
                chunks[1][2]= generateChunk(16*3,16*1)
                chunks[1][3]= generateChunk(16*4,16*1)
                chunks[1][4]= generateChunk(16*5,16*1)
                chunks[2] = []
                chunks[2][0] = generateChunk(16*1,16*2)
                chunks[2][1]= generateChunk(16*2,16*2)
                chunks[2][2]= generateChunk(16*3,16*2)
                chunks[2][3]= generateChunk(16*4,16*2)
                chunks[2][4]= generateChunk(16*5,16*2)
                chunks[3] = []
                chunks[3][0] = generateChunk(16*1,16*3)
                chunks[3][1]= generateChunk(16*2,16*3)
                chunks[3][2]= generateChunk(16*3,16*3)
                chunks[3][3]= generateChunk(16*4,16*3)
                chunks[3][4]= generateChunk(16*5,16*3)
                chunks[4] = []
                chunks[4][0] = generateChunk(16*1,16*4)
                chunks[4][1]= generateChunk(16*2,16*4)
                chunks[4][2]= generateChunk(16*3,16*4)
                chunks[4][3]= generateChunk(16*4,16*4)
                chunks[4][4]= generateChunk(16*5,16*4)
                
                function uuidv4() {
                    // Create an array with 16 elements
                    const array = new Uint8Array(16);
                    // Populate the array with random values
                    crypto.getRandomValues(array);
                
                    // Adjust values to conform to the UUIDv4 standard
                    array[6] = (array[6] & 0x0f) | 0x40; // Set version to 4
                    array[8] = (array[8] & 0x3f) | 0x80; // Set variant to 10
                
                    // Convert array values to hexadecimal and join them into a UUID string
                    return [...array].map((value, index) =>
                        (value.toString(16).padStart(2, '0') + (([4, 6, 8, 10].includes(index)) ? '-' : ''))
                    ).join('');
                }
                
    
                
                
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
        function findKeyByValue(obj: { [x: string]: any; hasOwnProperty: (arg0: string) => any; }, value: any) {
            for (let key in obj) {
                if (obj.hasOwnProperty(key) && obj[key] === value) {
                    return key;
                }
            }
            return null; // Return null if the value is not found
        }
        let json;
        try {
             json = JSON.parse(message.toString())
        } catch {
            console.error(`❌ ID ${this.socketClientId} sent malformed data (Error code 400)`)
            this.onmessage({data: `{"type": "error", "status": 400, "reason": "malformedJSON"}` })
            return
        }
        
        switch (json.type) {
            case "echo":
                const clientId = uuidv4();
                this.socketClientId = clientId

                
                this.onmessage({data: `{"type":"echoSuccess","status":200,"clientId": "${clientId}"}`});
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
                        console.error(`❌ ID ${this.socketClientId} sent invalid arguments (Error code 400)`)
                        this.onmessage({data: `{"type": "error", "status": 400, "reason": "invalidArgs"}` })
                        return;
                    }
                    
                
                    // Check if objects have changed
                   //if (JSON.stringify(objects) !== JSON.stringify(lastResult?.data)) {
                    this.onmessage({data: JSON.stringify(result)});
                  //  }
                    break;
                

            case "disconnect":
               
                this.send = () => {}
               this.socketClientId = ""
                break
            case "playerSet":
                
                    this.players[this.socketClientId] = json.playerName 
                    
                    this.onmessage({data: `{"type": "playerSetSuccess", "status":200}`})
               
                break;
            case "chatSend":
                let playerName = this.socketClientId
                        if (this.players[this.socketClientId] !== undefined) {
                            playerName = this.players[this.socketClientId]
                        }
               
                
                   
                        this.onmessage({data:`{"type": "chatReceive", "playerName": "${playerName}", "message": "${json.message}"}`})
                
                break
    }
  
}
  public url: string = "[integrated]"
}
export function getRunningIntegratedServer() {
    if (currentIntegrated) {
        return currentIntegrated
    } else {
        currentIntegrated = new IntegratedServer()
        return currentIntegrated
    }
    
}

