import { Command } from '@tauri-apps/plugin-shell';
import { writeFile, BaseDirectory } from '@tauri-apps/plugin-fs';

/**
 * Decodes a Base64 string into a Float32Array.
 * Optimized for high-performance binary data transfer from the engine.
 */
function decodeFloat32Base64(b64) {
    if (!b64) return new Float32Array(0);
    const binaryStr = atob(b64);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
    }
    return new Float32Array(bytes.buffer);
}

class SimulationService {
    constructor() {
        this.child = null;
        this.mockInterval = null;
    }

    /**
     * MOCK: Launches a simulated simulation for UI development.
     */
    async startLiveSimulation(config, { onMetrics, onParticles, onComplete, onError, onLog }) {
        console.log("MOCK: Starting Simulated Simulation...");
        if (onLog) onLog("Simulation Engine MOCK started (PID: 9999)");

        let step = 0;
        const totalSteps = config.simulation_parameters?.num_steps || 1000;
        const intervalSteps = config.simulation_parameters?.output_interval_steps || 10;
        
        // Mock Particles data
        const particleCount = 50000;
        const positions = new Float32Array(particleCount * 3);
        const temperatures = new Float32Array(particleCount);
        
        // Initial setup for positions
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 0.04;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 0.04;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 0.04;
            temperatures[i] = 20 + Math.random() * 50;
        }

        this.mockInterval = setInterval(() => {
            if (step >= totalSteps) {
                clearInterval(this.mockInterval);
                if (onComplete) onComplete();
                return;
            }

            step += intervalSteps;

            // Update mockup data
            for (let i = 0; i < particleCount; i++) {
                // Move them slightly and increase heat
                positions[i * 3 + 1] += 0.0001; 
                temperatures[i] = Math.min(1000, temperatures[i] + Math.random() * 8);
            }

            // Fire events
            onMetrics({
                type: 'metrics',
                step,
                max_temp_c: 20 + (step/totalSteps) * 800,
                force_x: 1000 + Math.random() * 500,
                force_y: 500 + Math.random() * 200,
                force_z: 1500 + Math.random() * 300,
                torque_nm: 15.5 + Math.random() * 5
            });

            onParticles({
                positions: new Float32Array(positions),
                temperatures: new Float32Array(temperatures),
                count: particleCount,
                step
            });

            if (onLog && step % 100 === 0) onLog(`Step ${step}/${totalSteps} complete.`);

        }, 100);

        return { pid: 9999, kill: () => clearInterval(this.mockInterval) };
    }

    /**
     * Forcefully stops the simulation.
     */
    async stopSimulation() {
        if (this.mockInterval) {
            clearInterval(this.mockInterval);
            this.mockInterval = null;
        }
    }
}

const simulationServiceInstance = new SimulationService();
export default simulationServiceInstance;
