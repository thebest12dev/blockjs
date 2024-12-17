
    export type ModLoader = {
        "modLoadType": "internal" | "game"
        "modLoaderVersion": string
        "loadMod": (modData: string, modName: string, storePersistent: boolean) => void
        "unloadMod": (modName: string, preventFurtherModLoading: boolean) => void
        "format": "blockjs" | "javascript" | "zip"
    }
    declare const JSZip: any;
    export const ModLoader = (function() {
        return class {
            static getDefaultModLoader(): ModLoader {
                return {
                    
                    modLoadType: "game",
                    loadMod: (modData, modName, storePersistent) => {
                        function extractFirstJSDoc(commentString: string) {
                            const firstCommentRegex = /\/\*\*([\s\S]*?)\*\//;
                            const annotationRegex = /@(\w+)(\s*\{(\w+)\})?\s+(\w+)?\s*(-\s*(.+))?/g;
                          
                            const firstCommentMatch = firstCommentRegex.exec(commentString);
                          
                            if (!firstCommentMatch) {
                              return null; // No JSDoc comment found
                            }
                          
                            const annotations: any = {};
                            const firstComment = firstCommentMatch[1]; // Get the content within the comment block
                          
                            let match;
                            
                            while ((match = annotationRegex.exec(firstComment)) !== null) {
                              const annotation = match[1];
                              const type = match[3] || null;
                              const nameOrValue = match[4] || null;
                              const description = match[6] || null;
                          
                              if (!annotations[annotation]) {
                                annotations[annotation] = [];
                              }
                          
                              annotations[annotation].push({
                                type: type,
                                nameOrValue: nameOrValue,
                                description: description
                              });
                            }
                          
                            return annotations;
                          }
                        JSZip.loadAsync(modData).then((mod: { file: (arg0: string) => { (): any; new(): any; async: { (arg0: string): Promise<any>; new(): any; }; }; }) => {
                            mod.file("index.js").async("string").then( (str: string) => {
                                const annotations = extractFirstJSDoc(str)
                                if (annotations.blockjs != undefined && annotations.declaration != undefined) {
                                    const requestObjects = (annotations.requestObjects[0].nameOrValue as string)
                                    
                                    if (!requestObjects.includes("BlockJS")) {
                                        console.error("Mod error ("+modName+"): The index.js file cannot load due to not requesting access to BlockJS.")
                                    } else {
                                      
                                        let script = document.createElement('script')
                                        
                                        script.innerHTML = str
                          
                                        script.id = "mod/"+modName;

                                        (window as any).script = script;

                                        document.body.append(script)
                                        console.log("Mod loaded!")
                                    }
                                } else {
                                    console.error("Mod error ("+modName+"): The index.js file is not a BlockJS file")
                                    return
                                }
                            })
                        })

       

       

                    },
                    unloadMod: (modName, preventFurtherModLoading) => {                       },   
                    modLoaderVersion: "0.3.0",
                    format: "blockjs"
                }
            }

        }
    })()
