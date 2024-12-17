export class Block {
    public position: number[];
    public size: number[];
    public rotation: number[];
    public indices: Uint16Array;
    public previousState: string | null;
    public lastVertices: any;
    public lastIndices: any;
    public vertices: Float32Array;

    constructor(px: number, py: number, pz: number, sx: number, sy: number, sz: number, rx = 0, ry = 0, rz = 0) {
        this.position = [px, py, pz];
        this.size = [sx, sy, sz];
        this.rotation = [rx, ry, rz];

        // Store initial state for change detection
        this.previousState = null;
        this.lastVertices = this.indices;
        this.lastIndices = this.vertices;
        this.vertices = Block.baseVertices;
        this.indices = Block.baseIndices;
        (window as any).objects.push(this);
    }
    public texture: string = "snow"
    static baseVertices = new Float32Array([
        // Front face
        -0.5, -0.5,  0.5,  0.0, 0.0,
         0.5, -0.5,  0.5,  1.0, 0.0,
         0.5,  0.5,  0.5,  1.0, 1.0,
        -0.5,  0.5,  0.5,  0.0, 1.0,
        
        // Back face
        -0.5, -0.5, -0.5,  0.0, 0.0,
        -0.5,  0.5, -0.5,  0.0, 1.0,
         0.5,  0.5, -0.5,  1.0, 1.0,
         0.5, -0.5, -0.5,  1.0, 0.0,
        
        // Top face
        -0.5,  0.5, -0.5,  0.0, 0.0,
        -0.5,  0.5,  0.5,  0.0, 1.0,
         0.5,  0.5,  0.5,  1.0, 1.0,
         0.5,  0.5, -0.5,  1.0, 0.0,
        
        // Bottom face
        -0.5, -0.5, -0.5,  0.0, 0.0,
         0.5, -0.5, -0.5,  1.0, 0.0,
         0.5, -0.5,  0.5,  1.0, 1.0,
        -0.5, -0.5,  0.5,  0.0, 1.0,
        
        // Right face
         0.5, -0.5, -0.5,  0.0, 0.0,
         0.5,  0.5, -0.5,  1.0, 0.0,
         0.5,  0.5,  0.5,  1.0, 1.0,
         0.5, -0.5,  0.5,  0.0, 1.0,
        
        // Left face
        -0.5, -0.5, -0.5,  0.0, 0.0,
        -0.5, -0.5,  0.5,  1.0, 0.0,
        -0.5,  0.5,  0.5,  1.0, 1.0,
        -0.5,  0.5, -0.5,  0.0, 1.0,
    ]);

    static baseIndices = new Uint16Array([
        0,  1,  2,  0,  2,  3,   // Front face
        4,  5,  6,  4,  6,  7,   // Back face
        8,  9, 10,  8, 10, 11,   // Top face
        12, 13, 14, 12, 14, 15,  // Bottom face
        16, 17, 18, 16, 18, 19,  // Right face
        20, 21, 22, 20, 22, 23,  // Left face
    ]);

    getVertices() {
        return Block.baseVertices;
    }

    getIndices() {
        return Block.baseIndices;
    }

    hasChanged() {
        const currentState = JSON.stringify(this.position) + JSON.stringify(this.size) + JSON.stringify(this.rotation);
        const hasChanged = currentState !== this.previousState;
        this.previousState = currentState;
        return hasChanged;
    }

    getAABB() {
        const halfSize = this.size.map((s: number) => s / 2);
        return {
            min: [this.position[0] - halfSize[0], this.position[1] - halfSize[1], this.position[2] - halfSize[2]],
            max: [this.position[0] + halfSize[0], this.position[1] + halfSize[1], this.position[2] + halfSize[2]]
        };
    }
    public meshType = "block"
}