import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';
import type { GlobalActivity } from '../types';

interface GlobeProps {
  activities: GlobalActivity[];
}

export const Globe: React.FC<GlobeProps> = ({ activities }) => {
  const globeRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const trailsRef = useRef<THREE.Line>(null);

  const { points, trails } = useMemo(() => {
    const pointsGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(activities.length * 3);
    const colors = new Float32Array(activities.length * 3);
    const sizes = new Float32Array(activities.length);

    // Trail points for connections
    const trailPositions: number[] = [];
    const trailColors: number[] = [];

    activities.forEach((activity, i) => {
      const [x, y, z] = activity.location;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const color = new THREE.Color(
        activity.type === 'commit' ? '#6366f1' :
        activity.type === 'pr' ? '#22c55e' : '#3b82f6'
      );
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = activity.intensity * 0.1;

      // Create trails between related activities
      if (i > 0) {
        trailPositions.push(
          positions[(i - 1) * 3],
          positions[(i - 1) * 3 + 1],
          positions[(i - 1) * 3 + 2],
          x, y, z
        );
        trailColors.push(
          color.r, color.g, color.b,
          color.r, color.g, color.b
        );
      }
    });

    pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pointsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    pointsGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const trailsGeometry = new THREE.BufferGeometry();
    trailsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(trailPositions, 3));
    trailsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(trailColors, 3));

    return { points: pointsGeometry, trails: trailsGeometry };
  }, [activities]);

  useFrame((state) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.001;
    }
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.001;
    }
    if (trailsRef.current) {
      trailsRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group>
      <Sphere ref={globeRef} args={[1, 64, 64]}>
        <meshPhongMaterial
          color="#1f2937"
          emissive="#374151"
          specular="#60a5fa"
          shininess={10}
          wireframe
          transparent
          opacity={0.8}
        />
      </Sphere>

      <points ref={pointsRef}>
        <primitive object={points} />
        <pointsMaterial
          size={2}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      <line ref={trailsRef}>
        <primitive object={trails} />
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </line>
    </group>
  );
};