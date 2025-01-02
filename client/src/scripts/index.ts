/// <reference path="renderer.ts" />
import { Block } from "./block";
import { Connection, getRunningIntegratedServer, IntegratedServer } from "./networking";
import { Output } from "./logger";

import { Renderer } from "./renderer";
import { World, World as World_} from "./world";
import { ModLoader } from "./mods";
import { BlockJSText, Button, Constants } from "./ui";

/**
 * The namespace for the `BlockJS` module that is used to make the underlying game work. It contains features such as rendering,
 * multiplayer connections, player handling etc. along comes with an integrated server (for singleplayer). 
 */
var canvas = document.getElementById('glCanvas') as HTMLCanvasElement;
    declare const JSZip: any;




var currentClientId = "";
let chunks: string | any[] = []

// Declare constants
declare const glMatrix: any;
declare const vec4: any;
declare const vec3: any;
declare const mat4: any;
export namespace Core {
    let gameName = "BlockJS" 
    export function setExternalGameName(name: string) {
        gameName = name
    }
    export function getExternalGameName(): string {
        return gameName;
    }
    
    const version = "0.4.0"
    export function getVersion(): string {
        return version
    }

    
    
    export const __internal = {
        
        internalCall: () => {
                
                
                var canvas = document.getElementById('glCanvas') as HTMLCanvasElement;
                        function resizeCanvas() { 
                            canvas.width = window.innerWidth; canvas.height = window.innerHeight;} window.addEventListener('resize', resizeCanvas); window.addEventListener('load', resizeCanvas);
                        ((t:any)=>{;Output.log("BlockJS version "+getVersion(), "BlockJS Internal");;setExternalGameName(t);Renderer.getRenderer().startRendering();Output.log("Initialized BlockJS as name "+getExternalGameName(), "BlockJS Internal");})("Cavesite")
                        document.addEventListener('keydown', (e) => {if (e.key === 'F12') e.preventDefault();}); document.addEventListener('contextmenu', (e) => e.preventDefault());
                        
        let keySequence: any = [];
        
        document.addEventListener('keydown', (event) => {
            const key = event.key;

            // Add key to sequence array
            keySequence.push(key);

            // Check if the sequence matches the required sequence
            if (keySequence.length > 2) { 
                keySequence.shift(); 
            }
            switch (keySequence.join('+').toUpperCase()) {
                case "F9+L":
                const popup = window.open("about:blank", "popup", "width=800,height=500");
                               
                popup.document.write("<style> body { font-family: Consolas, monospace; } </style>")
                    popup.document.title = "BlockJS Log";
        
                    Output.log("User has opened log console", "BlockJS Internal");
                    
                    Output.getLogs().forEach((element) => {
                       popup.document.write("<span>"+element+"</span><br>")
                    });
                    Output.setOnLoggedListener((message) => {
                        popup.document.write("<span>"+message+"</span><br>")
                    })
        
                event.preventDefault();
                keySequence = []; // Reset sequence after detection
                break;
                case ["F9+S"]:

            } 
        });

                    
                        
        const child = document.getElementById('crosshairContainer');

        const childHeight = child.clientHeight;
        const childWidth = child.clientWidth;
        child.style.top = `${((innerHeight - childHeight)/2)-10-16}px`;
        child.style.left = `${((innerWidth - childWidth)/2)+16-17}px`;
                        
                        {
                            
                            let socket: Connection;
                        document.getElementById("_3").innerHTML = "Codename "+getExternalGameName()+" upd-1733193941"
                        
                        const targetNode = document.getElementById('chatHistory');
                        document.getElementById('createWorld').addEventListener('mousedown',(e) => {
                            
                            setTimeout(() => {
                                
                                socket = new Connection(new IntegratedServer(),"player")
                                socket.setChatReceiveListener(() => {return {}})
                                child.removeAttribute("_2")
                                socket.setOnJoinListener(() => {
                                    for (let i = 0; i < 10; i++) {
                                        for (let z = 0; z < 10; z++) {
                                            socket.requestChunkAndRender(i,z)
                                        }
                                        
                                     }
                                     
                                     return {}
                                     
                                 })
                            }, 50);
                            
                        })
                        const observer = new MutationObserver(mutations => {
                            if (mutations.some(mutation => mutation.type === 'childList')) {
                                document.getElementById("chatHistory").removeAttribute("_2")
                                
                                setTimeout(() => {
                                    document.getElementById("chatHistory").setAttribute("_2","")
                                }, 5000)
                            }
                        });
                        
                        observer.observe(targetNode, { childList: true });
                        
                        function initializeMultiplayer() {
                            
                            let serverAddress = prompt("Enter the server address to connect")
                            let playerName = prompt("Enter the player name to be used")
                            socket = new Connection(serverAddress,playerName);
                             
                             socket.setChatReceiveListener((player: string,message: string) => {
                                let i = document.createElement("span")
                                i.innerHTML = `${player}: ${message}<br>`
                                document.getElementById("chatHistory").append(i)
                                return {}
                             })
                             socket.setOnJoinListener(() => {
                                for (let i = 0; i < 10; i++) {
                                    for (let z = 0; z < 10; z++) {
                                        socket.requestChunkAndRender(i,z)
                                    }
                                    
                                 }
                                 return {}
                             })
                             child.removeAttribute("_2")
                             
                        }
                        
                        // Select the button element by its ID
                        const button = document.getElementById('1');
                        document.getElementById("chatInput").addEventListener("keydown", function(event) {
                        if (event.key.toLowerCase() == "enter") {
                            
                        
                        document.getElementById('chatInput').setAttribute("_2","")
                        
                        socket.chat(document.getElementById("chatInput").innerHTML)
                        
                        
                        document.getElementById("chatInput").innerHTML = ""
                        event.preventDefault()
                        }
                        })
                        document.querySelectorAll(".noEnter").forEach((e) => {
                            e.addEventListener("keydown", (T: any) => {
                                if (T.key == "Enter") {
                                    T.preventDefault()
                                }
                                
                            })
                        })
                        // Select all elements with the class name 'example'
                        document.querySelectorAll(".backToTitleScreen").forEach((element => {
                        element.addEventListener('mousedown',(event) => {
                        
                        document.getElementById("multiplayerScreen").setAttribute("_2", "")
                        document.getElementById("singleplayerScreen").setAttribute("_2", "")
                        document.getElementById("multiplayerErrorScreen").setAttribute("_2", "")
                        document.getElementById("optionsScreen").setAttribute("_2", "")
                        document.getElementById("titleScreen").removeAttribute("_2")
                        }) 
                        }))
                        const follower = document.getElementById('hoverElement'); document.addEventListener('mousemove', (event) => { const x = event.clientX; const y = event.clientY; follower.style.left = `${x+20}px`; follower.style.top = `${y+20}px`; });
                        document.querySelectorAll(".hoverable").forEach((e) => {
                            e.addEventListener('mouseenter', () => {
                                document.getElementById("hoverElement").innerHTML = e.getAttribute("hoverdata")
                                document.getElementById("hoverElement").removeAttribute("_2")
                            })
                            e.addEventListener('mouseleave', () => {
                                document.getElementById("hoverElement").innerHTML = ""
                                document.getElementById("hoverElement").setAttribute("_2","")
                            })
                           
                            
                        })
                        if (localStorage.getItem("settings.developer") === "true") {
                            document.getElementById("_16").removeAttribute("_2")
                            document.getElementById("_161").removeAttribute("_2")
                            document.getElementById("_10").innerHTML = "Developer mode: On"
                        }
                            
                        // Add a keydown event listener to the document
                        document.addEventListener('mousedown', function(event) {
                        
                        switch (event.target) {
                        case button:
                            document.getElementById("multiplayerScreen").removeAttribute("_2")
                            document.getElementById("titleScreen").setAttribute("_2","")
                            break;
                        case document.getElementById('3'):
                            initializeMultiplayer()
                            break;
                        case document.getElementById("4"):
                            alert("Unimplemented!");
                            break;
                        case document.getElementById("0"):
                            document.getElementById("titleScreen").setAttribute("_2","")
                            document.getElementById("singleplayerScreen").removeAttribute("_2")
                            break;
                        case document.getElementById("_10"):
                            localStorage.setItem("settings.developer",localStorage.getItem("settings.developer") === "true" ? "false" : "true")    
                        
                            document.getElementById("_10").innerHTML = (localStorage.getItem("settings.developer") === "true") ? "Developer Mode: On" : "Developer Mode: Off";
                            alert("Reload to apply the changes.")
                            break;
                        case document.getElementById("12"):
                            (async function(window: any) {
                                try { 
                                    
                                    const [fileHandle] = await window.showOpenFilePicker(
                                       { 
                                           types: [ 
                                               { 
                                                   description: getExternalGameName() + ' Worlds', 
                                                   accept: { 'application/octet-stream+world': ['.world'] } 
                                               } 
                                           ], 
                                           excludeAcceptAllOption: true, 
                                           multiple: false 
                                       })
                                     const file = await fileHandle.getFile(); 
                                     const content = await file.text(); 
                                       
                                   } catch (err) { 
                                       console.error('Error:', err);
                                   }
                               
                            })(window)
                            break;
                            
                            
                        } 
                        });
                        }
                       
            }
        }
    
    }
    let Renderer_ = Renderer
    let Connection_ = Connection
    type Text_ = BlockJSText
    let Button_ = Button
    let Constants_ = Constants 
    let Block_ = Block
    let IntegratedServer_ = IntegratedServer
    let ModLoader_ = ModLoader;
    
namespace BlockJS {
    
    export const World = World_
    export const Renderer = Renderer_;
    export const Button = Button_
    export type BlockJSText = Text_
    export const Connection = Connection_
    export const ModLoader = ModLoader_
    export const Constants = Constants_
    export const Block = Block_
    export const IntegratedServer = IntegratedServer_
    export function getExternalGameName() {
       return Core.getExternalGameName()
    }
    export function getVersion() {
        return Core.getVersion()
    }
    export function setExternalGameName(name:string)  {
        Core.setExternalGameName(name)
    }
}
let importMap: any = {
    "core": {
        "renderer": Renderer,
        "functions": {exportObject},
        "networking": {IntegratedServer, Connection},
        "output": Output,
        "modloader": ModLoader,
        "constants": Constants,
        "world": World,
        "main":  {getExternalGameName: Core.getExternalGameName, setExternalGameName: Core.setExternalGameName, getVersion: Core.getVersion},
        "ui": {Button},
    }
}
function exportObject(object: object, name: string, namespace = "default") {
    if (!importMap[namespace]) {
        importMap[namespace] = {}
    }
    importMap[namespace][name] = object
    
}
function require(id:string): object {
    for (const key in importMap) {
            if (id.startsWith(key+":")) {
                return importMap[id.split(":")[0]][id.split(":")[1]]
            } else if (id === key) {
                console.warn("Error: "+key+" is a namespace"); 
                return undefined
            } else {
                console.warn("Object not found: "+id);
                return undefined 
            }
        
    }
}
(window as any).require = require;
(window as any).BlockJS = BlockJS
Core.__internal.internalCall()