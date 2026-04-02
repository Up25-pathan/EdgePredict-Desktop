
import React, { useMemo, Suspense, useState, useEffect } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Stage, Grid, Html } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { convertFileSrc } from '@tauri-apps/api/core';
import * as THREE from 'three';
import occtimportjs from 'occt-import-js';

// --- STEP LOADER COMPONENT ---
const StepModel = ({ path }) => {
    const [geometryGroup, setGeometryGroup] = useState(null);

    useEffect(() => {
        const loadStep = async () => {
            try {
                // Initialize OCCT
                const occt = await occtimportjs({
                    locateFile: (name) => {
                        if (name.endsWith('.wasm')) return '/occt-import-js.wasm';
                        return name;
                    }
                });

                // Fetch file
                const assetUrl = convertFileSrc(path);
                const response = await fetch(assetUrl);
                const buffer = await response.arrayBuffer();
                const fileBuffer = new Uint8Array(buffer);

                // Parse STEP
                const result = occt.ReadStepFile(fileBuffer, null);

                if (result && result.success) {
                    const group = new THREE.Group();

                    // Process Meshes
                    result.meshes.forEach(meshData => {
                        const geometry = new THREE.BufferGeometry();

                        // Positions
                        if (meshData.attributes.position) {
                            geometry.setAttribute('position', new THREE.Float32BufferAttribute(meshData.attributes.position.array, 3));
                        }

                        // Normals
                        if (meshData.attributes.normal) {
                            geometry.setAttribute('normal', new THREE.Float32BufferAttribute(meshData.attributes.normal.array, 3));
                        }

                        // Indices
                        if (meshData.index) {
                            geometry.setIndex(new THREE.Uint16BufferAttribute(meshData.index.array, 1));
                        }

                        // Check if we need to compute normals
                        if (!meshData.attributes.normal) {
                            geometry.computeVertexNormals();
                        }

                        const material = new THREE.MeshStandardMaterial({
                            color: new THREE.Color(meshData.color ? `rgb(${Math.round(meshData.color[0] * 255)}, ${Math.round(meshData.color[1] * 255)}, ${Math.round(meshData.color[2] * 255)})` : '#cbd5e1'),
                            metalness: 0.8,
                            roughness: 0.2
                        });

                        const mesh = new THREE.Mesh(geometry, material);
                        group.add(mesh);
                    });

                    // Rotate to stand upright (STEP often uses Z-up, Three.js uses Y-up)
                    group.rotation.x = -Math.PI / 2;

                    setGeometryGroup(group);
                }

            } catch (err) {
                console.error("STEP loading failed:", err);
            }
        };

        loadStep();
    }, [path]);

    if (!geometryGroup) return null;

    return <primitive object={geometryGroup} />;
};

// --- EXISTING STL/OBJ LOADER ---
// --- STL/OBJ LOADER COMPONENT ---
const StlObjModel = ({ path }) => {
    // Determine loader based on extension
    const extension = path.split('.').pop().toLowerCase();
    const Loader = extension === 'obj' ? OBJLoader : STLLoader;

    // Convert local path to Tauri asset URL -> tauri://localhost/...
    const assetUrl = convertFileSrc(path);

    const geom = useLoader(Loader, assetUrl);

    // If OBJ, it returns a Group, if STL it returns BufferGeometry
    const geometry = useMemo(() => {
        if (extension === 'obj') {
            // Find first mesh in group
            let mesh = null;
            geom.traverse((child) => {
                if (child.isMesh && !mesh) mesh = child;
            });
            return mesh ? mesh.geometry : null;
        }
        return geom;
    }, [geom, extension]);

    // Compute normals for proper lighting (Side Effect)
    React.useLayoutEffect(() => {
        if (geometry) geometry.computeVertexNormals();
    }, [geometry]);

    if (!geometry) return null;

    return (
        <mesh geometry={geometry} castShadow receiveShadow>
            <meshStandardMaterial
                color="#cbd5e1"
                roughness={0.2}
                metalness={0.8}
            />
        </mesh>
    );
};

const Tool3DViewer = ({ geometryPath }) => {
    // Check file type
    const extension = geometryPath ? geometryPath.split('.').pop().toLowerCase() : null;
    const isStep = extension === 'stp' || extension === 'step';
    const isSupported = ['stl', 'obj', 'stp', 'step'].includes(extension);

    return (
        <div className="w-full h-full bg-studio-canvas rounded-xl overflow-hidden border border-studio-border relative" style={{ minHeight: '300px' }}>
            {!geometryPath ? (
                <div className="absolute inset-0 flex items-center justify-center text-studio-text-muted flex-col gap-2">
                    <div className="w-16 h-16 rounded-full bg-studio-bg border border-studio-border flex items-center justify-center">
                        <span className="text-2xl opacity-50">⬡</span>
                    </div>
                    <p className="text-xs">No Geometry Selected</p>
                    <p className="text-[10px] text-studio-text-dim">Select a tool with linked geometry to preview</p>
                </div>
            ) : !isSupported ? (
                <div className="absolute inset-0 flex items-center justify-center text-studio-text-muted flex-col gap-2">
                    <div className="w-16 h-16 rounded-full bg-studio-bg border border-studio-border flex items-center justify-center">
                        <span className="text-2xl opacity-50">📄</span>
                    </div>
                    <p className="text-xs">Preview not supported for this file type</p>
                    <p className="text-[10px] text-studio-text-dim">Use .stl, .obj or .stp</p>
                </div>
            ) : (
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-200 to-white">
                    <Canvas shadows camera={{ position: [50, 50, 50], fov: 40 }} style={{ width: '100%', height: '100%' }}>
                        <Suspense fallback={<Html center><div className="text-slate-600 font-bold text-[10px] uppercase tracking-widest bg-white/80 px-4 py-2 rounded-full shadow-sm backdrop-blur whitespace-nowrap">Loading Geometry...</div></Html>}>
                            <Stage environment="studio" intensity={1.5} center adjustCamera={1.2}>
                                {isStep ? (
                                    <StepModel path={geometryPath} />
                                ) : (
                                    <StlObjModel path={geometryPath} />
                                )}
                            </Stage>
                            <Grid
                                cellSize={10}
                                sectionSize={50}
                                infiniteGrid
                                fadeDistance={200}
                                sectionColor="#94a3b8"
                                cellColor="#cbd5e1"
                            />
                        </Suspense>
                        <OrbitControls autoRotate autoRotateSpeed={1.0} makeDefault minDistance={10} maxDistance={200} />
                    </Canvas>
                </div>
            )}

            {/* Overlay label */}
            <div className="absolute top-3 left-3 px-2 py-1 bg-black/10 backdrop-blur rounded text-[10px] text-slate-500 font-mono font-bold border border-black/5 z-10">
                STUDIO PREVIEW
            </div>
        </div>
    );
};

export default Tool3DViewer;

