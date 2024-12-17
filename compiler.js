const chalkImport =  (async () => {return await import("chalk")} )()
let chalk;

chalkImport.then((chalk_) => {
    chalk = chalk_.default
})
const jsdom = require('jsdom'); 
const { JSDOM } = jsdom;
const { exec } = require('child_process');
const fs = require('fs');
const path = require("path");
function base64Encode(file) { 
    const bitmap = fs.readFileSync(file); 
    return Buffer.from(bitmap).toString('base64');
 }


 
 // Function to get file size in kilobytes
 function getFileSizeInKB(filePath) {
     try {
         const stats = fs.statSync(filePath);
         const fileSizeInBytes = stats.size;
         const fileSizeInKB = fileSizeInBytes / 1024;
         return fileSizeInKB;
     } catch (error) {
         console.error(`Error getting file size: ${error.message}`);
         return null;
     }
 }

 


//console.log(base64Encode("./license.md"))
/**
 * Checks if a specific argument exists in process.argv and optionally returns its value.
 * @param {string} argName - The name of the argument to check (e.g., 'thing' for --thing=2).
 * @returns {boolean|string|null} - Returns true if the argument exists without a value,
 * the value of the argument if a key-value pair is found, or null if the argument does not exist.
 */
function hasArgument(argName) {
    const argPrefix = `--${argName}`;

    // Find the argument in process.argv
    for (let arg of process.argv) {
        if (arg.startsWith(argPrefix)) {
            const [key, value] = arg.split('=');
            if (value !== undefined) {
                return value; // Return the value of the key-value pair
            }
            return true; // Return true if argument exists without a value
        }
    }
    
    return null; // Return null if argument does not exist
}

if (process.argv.length == 2) {
    console.log("No command specified, compiling normally...")
    exec('npx tsc && npx webpack', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            console.log(chalk.bold.red("Failed to compile client!"))
            return;
        } else {
            console.log(chalk.bold.green("Successfully compiled client. Output is in ./dist/bundle.js."))
        }
        
    });
} else {
    if (hasArgument("bundle")) {
        let finalString = ""
        console.log("Bundle command specified, bundling all assets to a single HTML file...")
        function compile() {
            
        
        exec('npx tsc && npx webpack', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`Stderr: ${stderr}`);
                console.log(chalk.bold.red("Failed to compile client! Client isn't up to date."))
                return;
            } else {
                console.log(chalk.bold.blue("[built] ")+chalk.bold.green("[client] ")+"./dist/bundle.js")
                fs.readFile('client/index.html', 'utf8', (err, data) => {
                    if (err) {
                        console.log(chalk.bold.red("Error while reading index.html: "+error))
                        return;
                    }
                    finalString = data
                    console.log(chalk.bold.white("[bundled] ")+chalk.bold.green("[site] ")+"./client/index.html")
                    const assets  = fs.readdirSync("./client/src/assets/core/textures"); 
                    
                    assets.forEach((file) => {
                        console.log(chalk.bold.white("[bundled] ")+chalk.bold.green("[asset] ")+"./client/src/assets/core/textures/"+file)
                        if (file == "favicon.ico") {
                            data = data.replaceAll("src/assets/core/textures/"+file,"data:image/x-icon;base64,"+base64Encode("./client/src/assets/core/textures/"+file))
                        } else {
                            
                            data = data.replaceAll("src/assets/core/textures/"+file,"data:image/png;base64,"+base64Encode("./client/src/assets/core/textures/"+file))
                        }
                        
                    })
                   
                    const dom = new JSDOM(data)
                    const document = dom.window.document
                    
                    const libs  = fs.readdirSync("./client/src/lib/"); 
                    
                    libs.forEach((file) => {
                        console.log(chalk.bold.white("[bundled] ")+chalk.bold.green("[library] ")+"./client/src/lib/"+file)
                        let element = document.createElement("script")
                        element.innerHTML = fs.readFileSync("./client/src/lib/"+file)
                        document.body.appendChild(element)
                    })
                    let bundleScript = fs.readFileSync("./dist/bundle.js")
                    assets.forEach((file) => {
                    
                        
                        
                            bundleScript = bundleScript.toString().replaceAll("src/assets/core/textures/"+file,"data:image/png;base64,"+base64Encode("./client/src/assets/core/textures/"+file))
                        
                        
                    })
                    const domScript = document.createElement("script")
                    domScript.innerHTML = bundleScript
                    document.body.appendChild(domScript)
                    const updatedHtml = dom.serialize();
                    fs.writeFileSync("client.html",updatedHtml)
                    console.log(chalk.bold.green("[output] ")+chalk.bold.blue("[uncompressed] ")+getFileSizeInKB("client.html").toFixed(1)+"kb ./client.html")
                    console.log(chalk.bold("compiled with 0 errors"))
                });
            }
            
        });

    }
    compile()
    if (hasArgument("watch")) 
        
        
        // Directory to watch
        
        
        // Function to execute when a change is detected
        



// Function to execute when a change is detected
var excludedDirectories = ['.git','.vscode','.idea','dist','random',"node_modules","build"]
function onChange(eventType, filename) {
    const fullPath = path.join("./", filename); 
     const isExcluded = excludedDirectories.some(dir => fullPath.includes(path.join("./", dir)));
    if (!isExcluded) {
        compile()
    }
    
}

let debounceTimeout;
const debounceInterval = 500; // Interval in milliseconds

// Watch the directory for changes
fs.watch("./", (eventType, filename) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        onChange(eventType, filename);
    }, debounceInterval);
});


        
        
        
        

        

        
    
    }
}

