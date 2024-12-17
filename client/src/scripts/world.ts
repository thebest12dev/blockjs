/**
     * The object for world loading and saving in .world format (BlockJS world format). It holds metadata like name of world,
     * version, and the actual chunks associated with it. It also has unexposed functions that relate to world saving and loading.
     */

    export const World = (function() {
    
        function stringToHex(str: string): string {
            let hex = "";
            for (let i = 0; i < str.length; i++) {
                let hexChar = str.charCodeAt(i).toString(16);
                if (hexChar.length === 1) {
                    hexChar = "0" + hexChar;
                }
                hex += hexChar;
            }
            return hex;
        }
    
        function arrayToHex(arr: number[][][]): string {
            if (!Array.isArray(arr)) {
                throw new Error("Input must be an array");
            }
    
            function toHex(value: any): string {
                if (typeof value === "number") {
                    return "04" + value.toString(16).padStart(2, "0");
                } else if (typeof value === "string") {
                    return "05" + stringToHex(value) + "04";
                } else if (Array.isArray(value)) {
                    return "07" + value.map(toHex).join("") + "08";
                } else {
                    throw new Error("Unsupported data type");
                }
            }
    
            return toHex(arr).replace(/[\x00-\x1F\x7F]/g, "");
        }
    
        function hexToArray(hex: string): any {
            
            if (typeof hex !== "string") { 
                throw new Error("Input must be a string");
            }
        
            function fromHex(value: string): any {
                let index = 0;
        
                function getNextChunk(length: number): string {
                    const chunk = value.slice(index, index + length);
                    index += length;
                    return chunk;
                }
        
                function parse(): any {
                    const type = getNextChunk(2);
                    
        
                    if (type === "04") {
                        var t = getNextChunk(2)
                        if (t.length == 0) {
                            t = "01"
                        }
                        return parseInt(t, 16);
                    } else if (type === "05") {
                        let hexStr = "";
                        let nextChunk;
                        while ((nextChunk = getNextChunk(2)) !== "04" && nextChunk !== "") {
                            hexStr += nextChunk;
                        }
                        return hexToString(hexStr);
                    } else if (type === "07") {
                        
                        const arr = [];
                        while (value.slice(index, index + 2) !== "08") {
                            
                            arr.push(parse());
                            if (index >= value.length) break; // Prevent infinite loop
                        }
                        
                        index += 2; // Skip the '08'
                        return arr;
                    } else if (type === "") {
                        // Handle empty type case if needed
                    } else {
                        throw new Error("Unsupported data type: " + type);
                    }
                }
        
                return parse();
            }
        
            function hexToString(hexStr: string): string {
                let str = '';
                for (let i = 0; i < hexStr.length; i += 2) {
                    str += String.fromCharCode(parseInt(hexStr.substr(i, 2), 16));
                }
                return str;
            }
        
            return fromHex(hex);
        }
        
        
    
        
    
        function hexToString(hex: string): string {
            let str = "";
            for (let i = 0; i < hex.length; i += 2) {
                str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
            }
            return str;
        }
    
        function append(view: DataView, dataHex: string): DataView {
            const currentLength = view.byteLength;
            const additionalLength = dataHex.length / 2;
            const newBuffer = new ArrayBuffer(currentLength + additionalLength);
            const newView = new DataView(newBuffer);
    
            // Copy existing data
            for (let i = 0; i < currentLength; i++) {
                newView.setUint8(i, view.getUint8(i));
            }
    
            // Append new data
            for (let i = 0; i < dataHex.length; i += 2) {
                newView.setUint8(currentLength + i / 2, parseInt(dataHex.substr(i, 2), 16));
            }
    
            return newView;
        }
    
        function sliceDataView(view: DataView, start: number, end: number): DataView {
            const length = end - start;
            const newBuffer = new ArrayBuffer(length);
            const newView = new DataView(newBuffer);
    
            for (let i = 0; i < length; i++) {
                newView.setUint8(i, view.getUint8(start + i));
            }
    
            return newView;
        }
    
        function splitDataView(view: DataView, separator: number, maxSplits?: number): string[] {
            let hexString = dataViewToHexString(view);
            const separatorHex = separator.toString(16).padStart(2, "0");
            const hexArray = hexString.split(separatorHex);
            return hexArray; // Return hex strings, not parsed integers
        }
    
        function dataViewToHexString(view: DataView): string {
            let hexString = "";
            for (let i = 0; i < view.byteLength; i++) {
                const byte = view.getUint8(i);
                hexString += byte.toString(16).padStart(2, "0");
            }
            return hexString;
        }
    
    
        return {
            load(data: ArrayBuffer): { worldName: string; version: string; chunks: any } {
                let dataView = new DataView(data);
                dataView = sliceDataView(dataView, 2, dataView.byteLength); // Skip first two bytes
    
                const hexString = dataViewToHexString(dataView);
            
                const parts = hexString.split("01",3);
    
                if (parts.length < 3) {
                    throw new Error("Invalid data format: Missing parts");
                }
    
                const versionHex = parts[0];
                const worldNameHex = parts[1];
                
                let chunksHex = parts[2];
                
                return {
                    version: hexToString(versionHex),
                    worldName: hexToString(worldNameHex),
                    chunks: hexToArray(chunksHex)
                };
            },
    
            save(object: { version: string; worldName: string; chunks: number[][][] } = { version: "", worldName: "", chunks: [[[0]]] }): ArrayBuffer {
                let arr = new ArrayBuffer(0);
                let dataView = new DataView(arr);
                dataView = append(dataView, "07fd");
                dataView = append(dataView, stringToHex(object.version));
                dataView = append(dataView, "01");
                dataView = append(dataView, stringToHex(object.worldName));
                dataView = append(dataView, "01");
                dataView = append(dataView, arrayToHex(object.chunks));
    
                return dataView.buffer;
            }
        };
    })();