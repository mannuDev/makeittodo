import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, RoundedBox, Text, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

const PALETTE = {
  light: { active: '#B5673A', done: '#3B6E5E', base: '#DCDFD4', text: '#1F2A24' },
  dark: { active: '#D98E5F', done: '#5FA48D', base: '#2B342E', text: '#EDEFE8' },
};

// A single bar that smoothly grows/shrinks toward a target height.
function Bar({ x, target, color, label, count }) {
  const groupRef = useRef();
  const height = useRef(0.2);

  useFrame((_, delta) => {
    height.current = THREE.MathUtils.damp(height.current, Math.max(target, 0.2), 4, delta);
    if (groupRef.current) {
      groupRef.current.scale.y = height.current;
      groupRef.current.position.y = (height.current * 1.4) / 2;
    }
  });

  return (
    <group position={[x, 0, 0]}>
      <group ref={groupRef}>
        <RoundedBox args={[0.9, 1.4, 0.9]} radius={0.12} smoothness={4} castShadow>
          <meshStandardMaterial color={color} roughness={0.45} metalness={0.05} />
        </RoundedBox>
      </group>
      <Text
        position={[0, -0.95, 0.5]}
        fontSize={0.32}
        color={color}
        anchorX="center"
        anchorY="middle"
      >
        {String(count)}
      </Text>
      <Text
        position={[0, -1.35, 0.5]}
        fontSize={0.16}
        color={color}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.05}
      >
        {label}
      </Text>
    </group>
  );
}

function Rig({ children }) {
  const ref = useRef();
  useFrame((state, delta) => {
    if (ref.current) {
      // Gentle perpetual rotation plus a subtle mouse-driven parallax tilt.
      ref.current.rotation.y += delta * 0.15;
      ref.current.rotation.x = THREE.MathUtils.damp(
        ref.current.rotation.x,
        state.pointer.y * 0.12,
        4,
        delta
      );
    }
  });
  return <group ref={ref}>{children}</group>;
}

export default function ProgressScene({ active, completed, theme = 'light' }) {
  const colors = PALETTE[theme] ?? PALETTE.light;
  const maxCount = Math.max(active, completed, 1);

  return (
    <div className="progress-scene" aria-hidden="true">
      <Canvas
        camera={{ position: [2.6, 1.8, 3.4], fov: 32 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.65} />
        <directionalLight position={[3, 4, 2]} intensity={0.9} castShadow />
        <pointLight position={[-3, 2, -2]} intensity={0.3} color={colors.done} />

        <Suspense fallback={null}>
          <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.4}>
            <Rig>
              <Bar
                x={-0.65}
                target={(active / maxCount) * 1.6}
                color={colors.active}
                label="OPEN"
                count={active}
              />
              <Bar
                x={0.65}
                target={(completed / maxCount) * 1.6}
                color={colors.done}
                label="DONE"
                count={completed}
              />
            </Rig>
          </Float>
          <ContactShadows position={[0, -1.5, 0]} opacity={0.35} scale={6} blur={2.2} far={2} />
        </Suspense>
      </Canvas>
    </div>
  );
}
