import React, { useMemo, Suspense, useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Bounds, Environment, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Loader2 } from 'lucide-react';

// --- MANUAL CONTROL IMPLEMENTATION ---
// --- MANUAL CONTROL IMPLEMENTATION (CRASH PROOF) ---
const SafeOrbitControls = () => {
    const { camera, gl, invalidate } = useThree();
    const controlsRef = useRef();

    useEffect(() => {
        // 1. GET THE DOM ELEMENT
        const domElement = gl.domElement;
        
        // 2. THE CRASH FIX: 
        // If Three.js hasn't created the <canvas> tag yet, STOP. 
        // Do not try to addEventListener to null.
        if (!domElement) return;

        const controls = new OrbitControls(camera, domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.2;
        controls.minPolarAngle = 0;
        controls.maxPolarAngle = Math.PI;
        
        controls.addEventListener('change', invalidate);
        controlsRef.current = controls;

        return () => {
            controls.removeEventListener('change', invalidate);
            controls.dispose();
        };
    }, [camera, gl, invalidate]);

    useFrame(() => {
        // Only update if controls exist
        if (controlsRef.current) {
            controlsRef.current.update();
        }
    });

    return null;
};

const ResultThreeDeeSnapshot = ({ nodeData, meshIndices, particleData }) => {
    // --- CRITICAL: Stable Reference for Event Attachment ---
    const containerRef = useRef(null);

    const { geometry, partPositions, partColors } = useMemo(() => {
        if (!nodeData || nodeData.length === 0) return {};

        const geom = new THREE.BufferGeometry();
        
        // Downsample for performance (Max 4000 nodes)
        const SKIP_FACTOR = nodeData.length > 4000 ? Math.ceil(nodeData.length / 4000) : 1;
        const count = Math.floor(nodeData.length / SKIP_FACTOR);

        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const color = new THREE.Color();

        let maxStress = 0.001;
        for (let i = 0; i < nodeData.length; i++) maxStress = Math.max(maxStress, nodeData[i].stress_MPa || 0);

        let writeIdx = 0;
        for (let i = 0; i < nodeData.length; i += SKIP_FACTOR) {
            const node = nodeData[i];
            const idx = writeIdx * 3;
            
            positions[idx] = node.position[0];
            positions[idx+1] = node.position[1];
            positions[idx+2] = node.position[2];

            const t = Math.min(1.0, Math.max(0.0, (node.stress_MPa || 0) / maxStress));
            color.setHSL(0.66 * (1.0 - t), 1.0, 0.5);
            colors[idx] = color.r; colors[idx+1] = color.g; colors[idx+2] = color.b;
            writeIdx++;
        }

        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        if (SKIP_FACTOR === 1 && meshIndices && meshIndices.length > 0) {
             geom.setIndex(meshIndices);
             geom.computeVertexNormals();
        }

        // Particles
        const MAX_PARTICLES = 800; 
        const pSkip = (particleData && particleData.length > MAX_PARTICLES) 
            ? Math.ceil(particleData.length / MAX_PARTICLES) 
            : 1;
        
        let pPosArray = [], pColArray = [];
        
        if (particleData && particleData.length > 0) {
            for (let i = 0; i < particleData.length; i += pSkip) {
                const p = particleData[i];
                if (Math.abs(p.position[0]) > 0.5) continue;

                pPosArray.push(p.position[0], p.position[1], p.position[2]);
                const t = Math.min(1.0, (p.temperature || 500) / 1500.0);
                color.setHSL(0.15, 1.0, 0.7 + (t * 0.3)); 
                pColArray.push(color.r, color.g, color.b);
            }
        }
        
        const pPos = new Float32Array(pPosArray);
        const pCol = new Float32Array(pColArray);

        return { geometry: geom, partPositions: pPos, partColors: pCol, isDownsampled: SKIP_FACTOR > 1 };
    }, [nodeData, meshIndices, particleData]);

    if (!geometry) return <div className="h-full flex items-center justify-center bg-gray-950 text-gray-500"><Loader2 className="w-8 h-8 animate-spin" /></div>;

    return (
        // FIX: We bind the Canvas events to this PARENT DIV (containerRef). 
        // This Div always exists, so addEventListener will never crash on null.
        <div ref={containerRef} className="w-full h-full relative">
            <Canvas 
                className="bg-gray-950" 
                camera={{ position: [5, 5, 5], fov: 40 }} 
                dpr={[1, 1.5]} 
                frameloop="demand"
                eventSource={containerRef} // <--- THE CRASH FIX
                gl={{ preserveDrawingBuffer: true, powerPreference: "high-performance" }}
            >
                <color attach="background" args={['#09090b']} />
                
                <Grid infiniteGrid fadeDistance={50} cellColor="#3f3f46" sectionColor="#6366f1" />
                <SafeOrbitControls />
                
                <Bounds fit clip observe margin={1.0}>
                    <group>
                        {meshIndices && meshIndices.length > 0 && !geometry.isDownsampled ? (
                            <mesh geometry={geometry}>
                                <meshStandardMaterial vertexColors metalness={0.3} roughness={0.4} side={THREE.DoubleSide} />
                            </mesh>
                        ) : (
                            <points geometry={geometry}>
                                <pointsMaterial size={0.005} vertexColors sizeAttenuation={true} />
                            </points>
                        )}

                        {partPositions.length > 0 && (
                            <points>
                                <bufferGeometry>
                                    <bufferAttribute attach="attributes-position" count={partPositions.length / 3} array={partPositions} itemSize={3} />
                                    <bufferAttribute attach="attributes-color" count={partColors.length / 3} array={partColors} itemSize={3} />
                                </bufferGeometry>
                                <pointsMaterial size={0.008} vertexColors transparent opacity={0.8} />
                            </points>
                        )}
                    </group>
                </Bounds>

                <Suspense fallback={null}>
                    <Environment preset="warehouse" />
                </Suspense>
            </Canvas>
        </div>
    );
};

export default ResultThreeDeeSnapshot;