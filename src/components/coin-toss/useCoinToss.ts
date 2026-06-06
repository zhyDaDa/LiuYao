import { useCallback, useRef, useState } from "react";
import { Euler, Quaternion } from "three";
import type { RapierRigidBody } from "@react-three/rapier";
import {
  createCoinTossResult,
  type CoinFace,
  type CoinTossResult,
} from "./coin-result";

interface UseCoinTossOptions {
  onResult: (result: CoinTossResult) => void;
}

export function useCoinToss({ onResult }: UseCoinTossOptions) {
  const bodiesRef = useRef<Array<RapierRigidBody | null>>([]);
  const facesRef = useRef<Array<CoinFace | null>>([null, null, null]);
  const throwingRef = useRef(false);
  const [round, setRound] = useState(0);
  const [throwing, setThrowing] = useState(false);
  const [ready, setReady] = useState(false);
  const [lastResult, setLastResult] = useState<CoinTossResult | null>(null);

  const registerCoin = useCallback(
    (index: number, body: RapierRigidBody | null) => {
      bodiesRef.current[index] = body;
      setReady(bodiesRef.current.slice(0, 3).every(Boolean));
    },
    [],
  );

  const finishToss = useCallback(
    (faces: CoinFace[]) => {
      throwingRef.current = false;
      facesRef.current = faces;

      const result = createCoinTossResult(faces);
      setThrowing(false);
      setLastResult(result);
      onResult(result);
    },
    [onResult],
  );

  const toss = useCallback(() => {
    const bodies = bodiesRef.current.slice(0, 3);
    if (!bodies.every(Boolean)) return;

    facesRef.current = [null, null, null];
    throwingRef.current = true;
    setThrowing(true);
    setLastResult(null);
    setRound((value) => value + 1);

    bodies.forEach((body, index) => {
      if (!body) return;

      const startX = (index - 1) * 0.78;
      const rotation = new Quaternion().setFromEuler(
        new Euler(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI,
        ),
      );

      body.setTranslation(
        {
          x: startX,
          y: 2.25 + Math.random() * 0.4,
          z: -0.25 + Math.random() * 0.5,
        },
        true,
      );
      body.setRotation(rotation, true);
      body.setLinvel(
        {
          x: (Math.random() - 0.5) * 2,
          y: 3.4 + Math.random() * 1.4,
          z: (Math.random() - 0.5) * 1.8,
        },
        true,
      );
      body.setAngvel(
        {
          x: 18 + Math.random() * 12,
          y: (Math.random() - 0.5) * 16,
          z: 18 + Math.random() * 12,
        },
        true,
      );
      body.wakeUp();
    });
  }, []);

  const settleCoin = useCallback(
    (index: number, face: CoinFace) => {
      if (!throwingRef.current || facesRef.current[index]) return;

      const nextFaces = [...facesRef.current];
      nextFaces[index] = face;
      facesRef.current = nextFaces;

      if (nextFaces.every(Boolean)) {
        finishToss(nextFaces as CoinFace[]);
      }
    },
    [finishToss],
  );

  return {
    round,
    throwing,
    ready,
    lastResult,
    registerCoin,
    settleCoin,
    toss,
  };
}
