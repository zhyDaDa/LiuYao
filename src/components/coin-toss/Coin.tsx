import { CylinderCollider, RigidBody } from "@react-three/rapier";
import type { RapierRigidBody } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { CanvasTexture, DoubleSide, Quaternion, Vector3 } from "three";
import type { CoinFace } from "./coin-result";

const COIN_RADIUS = 0.28;
const COIN_HALF_HEIGHT = 0.018;
const WORLD_UP = new Vector3(0, 1, 0);
const SETTLE_NORMAL_DOT = 0.62;

interface CoinProps {
  index: number;
  round: number;
  throwing: boolean;
  onRegister: (index: number, body: RapierRigidBody | null) => void;
  onSettle: (index: number, face: CoinFace) => void;
}

export function Coin({
  index,
  round,
  throwing,
  onRegister,
  onSettle,
}: CoinProps) {
  const bodyRef = useRef<RapierRigidBody | null>(null);
  const stableFramesRef = useRef(0);
  const uprightFramesRef = useRef(0);
  const reportedRoundRef = useRef(0);
  const yangTexture = useMemo(() => createFishTexture("#f7f4ea"), []);
  const yinTexture = useMemo(() => createFishTexture("#111111"), []);

  useEffect(() => {
    stableFramesRef.current = 0;
    uprightFramesRef.current = 0;
    reportedRoundRef.current = 0;
  }, [round]);

  useFrame(() => {
    const body = bodyRef.current;
    if (!body || !throwing || round === 0 || reportedRoundRef.current === round) {
      return;
    }

    const linvel = body.linvel();
    const angvel = body.angvel();
    const linearSpeed = Math.hypot(linvel.x, linvel.y, linvel.z);
    const angularSpeed = Math.hypot(angvel.x, angvel.y, angvel.z);

    const rotation = body.rotation();
    const normal = new Vector3(0, 1, 0).applyQuaternion(
      new Quaternion(rotation.x, rotation.y, rotation.z, rotation.w),
    );
    const normalDot = normal.dot(WORLD_UP);
    const isLowSpeed = linearSpeed < 0.12 && angularSpeed < 0.36;
    const isSettledFace = Math.abs(normalDot) >= SETTLE_NORMAL_DOT;
    const isAmbiguousFace = Math.abs(normalDot) < SETTLE_NORMAL_DOT;

    if (linearSpeed < 0.45 && angularSpeed < 1.2) {
      body.setLinvel(
        {
          x: linvel.x * 0.92,
          y: linvel.y * 0.92,
          z: linvel.z * 0.92,
        },
        true,
      );
      body.setAngvel(
        {
          x: angvel.x * 0.82,
          y: angvel.y * 0.82,
          z: angvel.z * 0.82,
        },
        true,
      );
    }

    if (isLowSpeed && isAmbiguousFace) {
      uprightFramesRef.current += 1;
    } else {
      uprightFramesRef.current = 0;
    }

    if (uprightFramesRef.current > 10) {
      const direction = index % 2 === 0 ? 1 : -1;
      body.applyImpulse(
        {
          x: 0.018 * direction,
          y: 0.012,
          z: 0.012 * (Math.random() > 0.5 ? 1 : -1),
        },
        true,
      );
      body.setAngvel(
        {
          x: 1.4 * direction,
          y: 0.2,
          z: 1.1 * (Math.random() > 0.5 ? 1 : -1),
        },
        true,
      );
      uprightFramesRef.current = 0;
      stableFramesRef.current = 0;
      return;
    }

    if (isLowSpeed && isSettledFace) {
      stableFramesRef.current += 1;
    } else {
      stableFramesRef.current = 0;
    }

    if (stableFramesRef.current < 18) return;

    const face: CoinFace = normalDot >= 0 ? "heads" : "tails";

    reportedRoundRef.current = round;
    onSettle(index, face);
  });

  return (
    <RigidBody
      ref={(body) => {
        bodyRef.current = body;
        onRegister(index, body);
      }}
      colliders={false}
      position={[(index - 1) * 0.78, 1.2, 0]}
      rotation={[Math.PI / 2, 0, 0]}
      linearDamping={1.35}
      angularDamping={2.2}
      canSleep
      ccd
    >
      <CylinderCollider
        args={[COIN_HALF_HEIGHT, COIN_RADIUS]}
        friction={2.4}
        restitution={0.12}
        density={7.5}
      />
      <group>
        <mesh castShadow receiveShadow>
          <cylinderGeometry
            args={[COIN_RADIUS, COIN_RADIUS, COIN_HALF_HEIGHT * 2, 64]}
          />
          <meshStandardMaterial
            color="#c99137"
            roughness={0.46}
            metalness={0.72}
          />
        </mesh>
        <mesh
          position={[0, COIN_HALF_HEIGHT + 0.004, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[COIN_RADIUS * 0.88, 96]} />
          <meshStandardMaterial
            map={yangTexture}
            roughness={0.32}
            metalness={0.08}
            side={DoubleSide}
          />
        </mesh>
        <mesh
          position={[0, -COIN_HALF_HEIGHT - 0.004, 0]}
          rotation={[Math.PI / 2, 0, Math.PI]}
        >
          <circleGeometry args={[COIN_RADIUS * 0.88, 96]} />
          <meshStandardMaterial
            map={yinTexture}
            roughness={0.32}
            metalness={0.08}
            side={DoubleSide}
          />
        </mesh>
        <mesh position={[0, COIN_HALF_HEIGHT + 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[COIN_RADIUS * 0.89, 0.011, 12, 64]} />
          <meshStandardMaterial color="#d6a343" roughness={0.36} metalness={0.72} />
        </mesh>
        <mesh position={[0, -COIN_HALF_HEIGHT - 0.006, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[COIN_RADIUS * 0.89, 0.011, 12, 64]} />
          <meshStandardMaterial color="#d6a343" roughness={0.36} metalness={0.72} />
        </mesh>
      </group>
    </RigidBody>
  );
}

function createFishTexture(fishColor: string) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return new CanvasTexture(canvas);
  }

  const center = size / 2;
  const radius = size * 0.47;
  const bgColor = "#8a5529";

  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.clip();

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = fishColor;
  ctx.beginPath();
  ctx.moveTo(center, center - radius * 0.9);
  ctx.bezierCurveTo(
    center + radius * 0.68,
    center - radius * 0.58,
    center + radius * 0.68,
    center + radius * 0.28,
    center,
    center + radius * 0.84,
  );
  ctx.bezierCurveTo(
    center - radius * 0.5,
    center + radius * 0.32,
    center - radius * 0.5,
    center - radius * 0.44,
    center,
    center - radius * 0.9,
  );
  ctx.fill();

  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.arc(center + radius * 0.16, center - radius * 0.3, radius * 0.08, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.lineWidth = 7;
  ctx.strokeStyle = "#d6a343";
  ctx.stroke();

  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
