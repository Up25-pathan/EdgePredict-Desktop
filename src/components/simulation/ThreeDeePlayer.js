import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Html, ContactShadows, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Play, Pause, Rewind, Settings } from 'lucide-react';

// -------------------------------------------------------------------
// --- 1. R&D TOOL MODEL (Dynamic Auto-Scaled Heatmap)
// -------------------------------------------------------------------
function RndToolModel({ nodeData, meshIndices }) {
    const meshRef = useRef();

    // Calculate dynamic temperature range for better visualization
    const { minTemp, maxTemp } = useMemo(() => {
        if (!nodeData || nodeData.length === 0) return { minTemp: 20, maxTemp: 100 };
        let min = Infinity, max = -Infinity;
        for (let i = 0; i < nodeData.length; i++) {
            const t = nodeData[i].temperature_C || nodeData[i].temperature || 25;
            if (t < min) min = t;
            if (t > max) max = t;
        }
        // Add a small buffer so we don't divide by zero
        return { minTemp: min, maxTemp: Math.max(max, min + 5) };
    }, [nodeData]);

    const geometry = useMemo(() => {
        if (!nodeData || nodeData.length === 0 || !meshIndices || meshIndices.length === 0) return null;

        const geom = new THREE.BufferGeometry();
        const vertices = new Float32Array(nodeData.length * 3);
        const colors = new Float32Array(nodeData.length * 3);
        const color = new THREE.Color();

        nodeData.forEach((node, i) => {
            // Position
            const pos = Array.isArray(node.position) ? node.position : [0,0,0];
            vertices[i * 3] = pos[0];
            vertices[i * 3 + 1] = pos[1];
            vertices[i * 3 + 2] = pos[2];

            // Dynamic Color Scaling
            const temp = node.temperature_C || node.temperature || 25;
            // Normalize 0..1 based on the ACTUAL range of the simulation
            const t = (temp - minTemp) / (maxTemp - minTemp);
            
            // Turbo-like Gradient: Blue -> Green -> Yellow -> Red
            color.setHSL(0.6 - (t * 0.6), 1.0, 0.5);
            
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        });

        geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geom.setIndex(meshIndices);
        geom.computeVertexNormals();
        return geom;
    }, [nodeData, meshIndices, minTemp, maxTemp]);

    if (!geometry) return null;

    return (
        <mesh ref={meshRef} geometry={geometry}>
            <meshStandardMaterial 
                vertexColors={true} 
                metalness={0.6} 
                roughness={0.3} 
                side={THREE.DoubleSide} 
            />
        </mesh>
    );
}

// -------------------------------------------------------------------
// --- 2. SPH PARTICLE SYSTEM (Workpiece vs Chips)
// -------------------------------------------------------------------
function SphParticles({ frames, currentFrameIndex }) {
    const meshRef = useRef();
    const dummy = useMemo(() => new THREE.Object3D(), []);

    useEffect(() => {
        if (!meshRef.current || !frames || frames.length === 0) return;
        
        const frame = frames[currentFrameIndex];
        if (!frame || !frame.particles) {
            meshRef.current.count = 0;
            return;
        }

        const particles = frame.particles;
        meshRef.current.count = particles.length;

        const color = new THREE.Color();

        particles.forEach((p, i) => {
            // Position
            dummy.position.set(p.position[0], p.position[1], p.position[2]);
            
            // Check Status: Is it a Chip or Solid Block?
            const isChip = p.status === "chip" || p.status === "CHIP_FLOWING";
            
            // Scale chips slightly larger to see them
            const scale = isChip ? 0.0008 : 0.0006; 
            dummy.scale.setScalar(scale);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);

            if (isChip) {
                // CHIPS: Heat Map Color (Gold/Red)
                // Normalized 20C to 400C for chips
                const t = Math.max(0, Math.min(1, (p.temperature - 20) / 380));
                color.setHSL(0.1 + (t * 0.05), 1.0, 0.5 + (t * 0.4)); 
            } else {
                // WORKPIECE: Dark Metallic Gray (Stable)
                // Slight tint if it starts heating up
                const t = Math.max(0, Math.min(1, (p.temperature - 20) / 100));
                if (t > 0.1) {
                    color.setHSL(0.6, 0.2, 0.3 + t*0.2); // Slight blue heat
                } else {
                    color.setHex(0x4a5568); // Dark Gray (Cool Steel)
                }
            }
            
            meshRef.current.setColorAt(i, color);
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;

    }, [frames, currentFrameIndex, dummy]);

    return (
        <instancedMesh ref={meshRef} args={[null, null, 8000]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial roughness={0.4} metalness={0.7} />
        </instancedMesh>
    );
}

// -------------------------------------------------------------------
// --- 3. MAIN PLAYER COMPONENT
// -------------------------------------------------------------------
const ThreeDeePlayer = ({ simulation }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [frameIndex, setFrameIndex] = useState(0);
    
    // Safe Data Extraction
    const { frames, finalNodeStates, meshIndices } = useMemo(() => {
        if (!simulation?.results) return { frames: [], finalNodeStates: [], meshIndices: [] };
        
        try {
            const results = typeof simulation.results === 'string' 
                ? JSON.parse(simulation.results) 
                : simulation.results;
            
            return {
                frames: results.visualization_data || [],
                finalNodeStates: results.final_node_states || [],
                meshIndices: results.mesh_connectivity || []
            };
        } catch (e) {
            return { frames: [], finalNodeStates: [], meshIndices: [] };
        }
    }, [simulation]);

    const maxFrames = frames.length > 0 ? frames.length - 1 : 0;

    // Animation Loop
    useEffect(() => {
        let interval;
        if (isPlaying && maxFrames > 0) {
            interval = setInterval(() => {
                setFrameIndex(prev => (prev >= maxFrames ? 0 : prev + 1));
            }, 80); // Slightly faster 12.5 FPS
        }
        return () => clearInterval(interval);
    }, [isPlaying, maxFrames]);

    const togglePlay = () => setIsPlaying(!isPlaying);
    const handleSlider = (e) => {
        setIsPlaying(false);
        setFrameIndex(parseInt(e.target.value));
    };

    return (
        <div className="w-full h-full flex flex-col bg-gray-950 rounded-xl overflow-hidden border border-gray-800 relative group shadow-2xl">
            
            {/* 3D Viewport */}
            <div className="flex-grow relative">
                <Canvas camera={{ position: [0.04, 0.03, 0.05], fov: 45 }} shadows>
                    <color attach="background" args={['#111827']} />
                    
                    {/* Lighting Setup */}
                    <ambientLight intensity={0.4} />
                    <spotLight position={[10, 10, 5]} angle={0.15} penumbra={1} intensity={2} castShadow />
                    <pointLight position={[-10, -5, -5]} intensity={1} color="#4f46e5" />
                    <Environment preset="city" />
                    
                    <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.8} />
                    
                    <Grid 
                        cellSize={0.005} 
                        sectionSize={0.025} 
                        infiniteGrid 
                        fadeDistance={0.15} 
                        fadeStrength={0.6} 
                        sectionColor="#6366f1" 
                        cellColor="#1f2937" 
                    />

                    <Suspense fallback={<Html center><div className="text-indigo-400 text-xs font-bold tracking-widest animate-pulse">LOADING DIGITAL TWIN...</div></Html>}>
                        <group position={[0, 0.005, 0]}> {/* Lift up slightly */}
                            <RndToolModel nodeData={finalNodeStates} meshIndices={meshIndices} />
                            <SphParticles frames={frames} currentFrameIndex={frameIndex} />
                        </group>
                        <ContactShadows opacity={0.4} scale={10} blur={2.5} far={4} />
                    </Suspense>
                </Canvas>

                {/* HUD Overlay */}
                <div className="absolute top-4 left-4 pointer-events-none select-none space-y-2">
                    <div className="bg-black/70 backdrop-blur-md p-3 rounded-lg text-xs text-gray-300 font-mono border border-white/10 shadow-xl w-48">
                        <div className="flex justify-between mb-1">
                            <span className="text-gray-500">SIM STEP</span>
                            <span className="text-white font-bold">{frames[frameIndex]?.step || 0}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                            <span className="text-gray-500">ACTIVE CHIPS</span>
                            <span className="text-yellow-400 font-bold">{frames[frameIndex]?.particles?.filter(p => p.status === 'chip')?.length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">PEAK TEMP</span>
                            <span className="text-red-400 font-bold">
                                {frames[frameIndex]?.particles?.reduce((max, p) => Math.max(max, p.temperature), 0).toFixed(0) || 0}°C
                            </span>
                        </div>
                    </div>
                </div>
                
                {/* Legend */}
                <div className="absolute top-4 right-4 pointer-events-none select-none">
                    <div className="bg-black/70 backdrop-blur-md p-2 rounded-lg text-[10px] text-gray-400 border border-white/10 flex flex-col gap-1">
                         <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-gray-500 mr-2"></div> Workpiece</div>
                         <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-yellow-400 mr-2"></div> Hot Chip</div>
                         <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div> Tool (Cool)</div>
                         <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div> Tool (Hot)</div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="h-16 bg-gray-900 border-t border-gray-800 flex items-center px-6 space-x-6 z-10 select-none">
                <button 
                    onClick={togglePlay}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-500/30 active:scale-95"
                >
                    {isPlaying ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" className="ml-0.5" />}
                </button>

                <div className="flex-grow flex flex-col justify-center">
                    <input 
                        type="range" min="0" max={maxFrames} value={frameIndex} onChange={handleSlider}
                        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
                    />
                    <div className="flex justify-between text-[10px] text-gray-500 mt-2 font-mono uppercase tracking-wider">
                        <span>Start</span>
                        <span>{((frameIndex / (maxFrames || 1)) * 100).toFixed(0)}% Complete</span>
                        <span>End</span>
                    </div>
                </div>
                
                <div className="flex items-center space-x-2 border-l border-gray-700 pl-6">
                    <button onClick={() => setFrameIndex(0)} className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                        <Rewind size={18} />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                        <Settings size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ThreeDeePlayer;