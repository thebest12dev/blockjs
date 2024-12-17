/**
 * Checks if a specific argument exists in process.argv and optionally returns its value.
 * @param {string} argName - The name of the argument to check (e.g., 'thing' for --thing=2).
 * @returns {boolean|string|null} - Returns true if the argument exists without a value,
 * the value of the argument if a key-value pair is found, or null if the argument does not exist.
 */
const server = require("./server.js")
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


if (hasArgument("server")) {
   ( hasArgument("port") !== true && hasArgument("port") !== null )? console.log("Starting server at port "+hasArgument("port")+"...") : console.log("Starting server at port 32067...")
    if (( hasArgument("port") !== true && hasArgument("port") !== null )) {
        server.start(parseInt(hasArgument("port")))
    } else {
        server.start(32067)
    }
    

}