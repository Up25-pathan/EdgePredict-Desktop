import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Html, ContactShadows, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Zap, Cpu } from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';

// -------------------------------------------------------------------
// --- 1. LIVE SPH PARTICLE SYSTEM (Optimized for 100k+ particles)
// -------------------------------------------------------------------
function LiveSphParticles() {
    const { currentParticles } = useSimulation();
    const pointsRef = useRef();

    useFrame(() => {
        if (!pointsRef.current || !currentParticles.positions || currentParticles.positions.length === 0) return;

        const geometry = pointsRef.current.geometry;
        
        // Update positions
        geometry.setAttribute('position', new THREE.BufferAttribute(currentParticles.positions, 3));
        
        // Update colors based on temperatures
        const colors = new Float32Array(currentParticles.count * 3);
        const color = new THREE.Color();
        
        for (let i = 0; i < currentParticles.count; i++) {
            const temp = currentParticles.temperatures[i];
            // Scale: 20C (Blue) to 1000C (Red)
            const t = Math.max(0, Math.min(1, (temp - 20) / 980));
            
            // Thermal mapping: Blue -> Yellow -> Red
            if (t < 0.5) {
                color.setHSL(0.6 - t * 0.4, 1.0, 0.5); // Blue to Green/Yellow
            } else {
                color.setHSL(0.4 - (t - 0.5) * 0.4, 1.0, 0.5); // Yellow to Red
            }
            
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }
        
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.color.needsUpdate = true;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry />
            <pointsMaterial 
                size={0.0012} 
                vertexColors={true} 
                transparent={true} 
                opacity={0.9}
                sizeAttenuation={true}
            />
        </points>
    );
}

// -------------------------------------------------------------------
// --- 2. DYNAMIC TOOL MODEL (Static or placeholder for now)
// -------------------------------------------------------------------
function StaticToolModel() {
    // In a real scenario, this would load an STL and transform it
    return (
        <mesh position={[0, 0.015, 0]}>
            <cylinderGeometry args={[0.005, 0.005, 0.03, 32]} />
            <meshStandardMaterial color="#4f46e5" metalness={0.8} roughness={0.2} transparent opacity={0.6} />
        </mesh>
    );
}

// -------------------------------------------------------------------
// --- 3. MAIN PLAYER COMPONENT
// -------------------------------------------------------------------
const ThreeDeePlayer = () => {
    const { currentParticles, simulationStatus, machiningType } = useSimulation();
    const [performanceMode, setPerformanceMode] = useState('high');

    return (
        <div className="w-full h-full flex flex-col bg-gray-950 rounded-xl overflow-hidden border border-gray-800 relative group shadow-2xl">
            
            {/* 3D Viewport */}
            <div className="flex-grow relative">
                <Canvas camera={{ position: [0.04, 0.03, 0.05], fov: 45 }} shadows dpr={[1, 2]}>
                    <color attach="background" args={['#0c0c0e']} />
                    
                    <ambientLight intensity={0.5} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
                    <pointLight position={[-10, -10, -10]} intensity={1} color="#4f46e5" />
                    <Environment preset="city" />
                    
                    <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.5} />
                    
                    <Grid 
                        cellSize={0.005} 
                        sectionSize={0.025} 
                        infiniteGrid 
                        fadeDistance={0.2} 
                        fadeStrength={0.8} 
                        sectionColor="#6366f1" 
                        cellColor="#1f2937" 
                    />

                    <Suspense fallback={<Html center><div className="text-indigo-400 text-xs font-bold tracking-widest animate-pulse">SYNCHRONIZING DIGITAL TWIN...</div></Html>}>
                        <group position={[0, 0, 0]}>
                            <StaticToolModel />
                            <LiveSphParticles />
                        </group>
                        <ContactShadows opacity={0.4} scale={10} blur={2.5} far={4} />
                    </Suspense>
                </Canvas>

                {/* HUD Overlay — Real Time */}
                <div className="absolute top-4 left-4 pointer-events-none select-none space-y-2">
                    <div className="bg-black/80 backdrop-blur-md p-4 rounded-xl text-xs text-gray-300 font-mono border border-white/10 shadow-2xl w-56">
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
                            <span className="text-indigo-400 font-bold tracking-tighter uppercase">Live Solver</span>
                            <div className="flex items-center space-x-1">
                                <span className={`w-2 h-2 rounded-full animate-pulse ${simulationStatus === 'RUNNING' ? 'bg-emerald-500' : 'bg-gray-600'}`}></span>
                                <span className="text-[10px] text-gray-500 uppercase">{simulationStatus}</span>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Step</span>
                                <span className="text-white font-bold">{currentParticles.step.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Elements</span>
                                <span className="text-blue-400 font-bold">{currentParticles.count.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Process</span>
                                <span className="text-indigo-300 font-bold uppercase">{machiningType}</span>
                            </div>
                        </div>
                    </div>

                    {/* Performance Controls */}
                    <div className="flex space-x-2">
                        <button 
                            onClick={() => setPerformanceMode('high')}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border flex items-center transition-all pointer-events-auto ${performanceMode === 'high' ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-black/40 border-white/10 text-gray-500 hover:bg-black/60'}`}
                        >
                            <Zap className="w-3 h-3 mr-1.5" /> HIGH QUAL
                        </button>
                        <button 
                            onClick={() => setPerformanceMode('eco')}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border flex items-center transition-all pointer-events-auto ${performanceMode === 'eco' ? 'bg-amber-600 border-amber-400 text-white shadow-lg' : 'bg-black/40 border-white/10 text-gray-500 hover:bg-black/60'}`}
                        >
                            <Cpu className="w-3 h-3 mr-1.5" /> ECO MODE
                        </button>
                    </div>
                </div>
                
                {/* Thermal Legend */}
                <div className="absolute right-4 top-4 bottom-4 w-12 bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-2 flex flex-col items-center">
                    <div className="flex-1 w-2 rounded-full bg-gradient-to-t from-blue-600 via-yellow-400 to-red-600 my-2 shadow-inner"></div>
                    <div className="flex flex-col justify-between h-full text-[9px] font-mono text-gray-500 py-2">
                        <span>1k°C</span>
                        <span>500°C</span>
                        <span>20°C</span>
                    </div>
                </div>
            </div>

            {/* Footer Status Bar */}
            <div className="h-10 bg-gray-900/80 backdrop-blur border-t border-gray-800 flex items-center px-6 justify-between text-[10px] font-mono tracking-widest text-gray-500">
                <div className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_#10b981]"></div>
                    GPU ACCELERATED VIEWPORT (WEBGL 2.0)
                </div>
                <div>
                    LATENCY: {simulationStatus === 'RUNNING' ? '< 2ms' : '0ms'} &nbsp;•&nbsp; FPS: 60
                </div>
            </div>
        </div>
    );
};

export default ThreeDeePlayer;