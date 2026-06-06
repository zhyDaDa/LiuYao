import { Canvas } from "@react-three/fiber";
import { CuboidCollider, Physics, RigidBody } from "@react-three/rapier";
import { useCallback } from "react";
import { TapButton } from "../TapButton";
import type { CoinTossResult } from "./coin-result";
import { formatCoinFace } from "./coin-result";
import { Coin } from "./Coin";
import styles from "./CoinToss.module.css";
import { useCoinToss } from "./useCoinToss";

interface CoinTossCanvasProps {
  disabled?: boolean;
  onResult: (result: CoinTossResult) => void;
}

export function CoinTossCanvas({
  disabled = false,
  onResult,
}: CoinTossCanvasProps) {
  const handleResult = useCallback(
    (result: CoinTossResult) => {
      onResult(result);
    },
    [onResult],
  );
  const { round, throwing, ready, lastResult, registerCoin, settleCoin, toss } =
    useCoinToss({
      onResult: handleResult,
    });

  return (
    <div className={styles.wrap}>
      <div className={styles.stage}>
        <Canvas
          shadows
          camera={{ position: [0, 2.6, 4.4], fov: 42 }}
          gl={{ alpha: true, antialias: true }}
        >
          <ambientLight intensity={0.85} />
          <directionalLight
            castShadow
            intensity={1.25}
            position={[2.8, 5.2, 3.6]}
          />
          <Physics gravity={[0, -9.81, 0]}>
            <RigidBody type="fixed">
              <CuboidCollider args={[2.2, 0.08, 1.55]} position={[0, -0.08, 0]} />
              <mesh receiveShadow position={[0, -0.09, 0]}>
                <boxGeometry args={[4.4, 0.08, 3.1]} />
                <meshStandardMaterial color="#e2d4b6" roughness={0.75} />
              </mesh>
            </RigidBody>
            {[0, 1, 2].map((index) => (
              <Coin
                key={index}
                index={index}
                round={round}
                throwing={throwing}
                onRegister={registerCoin}
                onSettle={settleCoin}
              />
            ))}
          </Physics>
        </Canvas>
      </div>

      <div className={styles.controls}>
        <div className={styles.buttonRow}>
          <TapButton
            color="primary"
            onTap={toss}
            disabled={disabled || throwing || !ready}
            block
          >
            {throwing ? "投掷中" : ready ? "投掷三枚铜钱" : "准备铜钱"}
          </TapButton>
          {throwing && (
            <TapButton fill="outline" onTap={toss} disabled={disabled || !ready}>
              重新投掷
            </TapButton>
          )}
        </div>
        <div className={styles.result}>
          {lastResult ? (
            <>
              <span>{lastResult.faces.map(formatCoinFace).join(" / ")}</span>
              <strong>{lastResult.label}</strong>
            </>
          ) : (
            <>
              <span>等待投掷</span>
              <strong>结果会自动填入手动起卦</strong>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
