import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { Tour } from "antd";
import type { TourProps, TourStepProps } from "antd";
import { appTourGroups, type TourId } from "./tour.config";

type AppTourContextValue = {
  startTour: (tourId: TourId) => void;
  closeTour: () => void;
  registerTarget: (key?: string) => (node: HTMLElement | null) => void;
};

const AppTourContext = createContext<AppTourContextValue | null>(null);

export function AppTourProvider({ children }: PropsWithChildren) {
  const targetMapRef = useRef<Record<string, HTMLElement>>({});
  const refCallbackMapRef = useRef<
    Record<string, (node: HTMLElement | null) => void>
  >({});

  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const [activeTourId, setActiveTourId] = useState<TourId | null>(null);

  const registerTarget = useCallback((key?: string) => {
    if (!key) return () => {};
    if (!refCallbackMapRef.current[key]) {
      refCallbackMapRef.current[key] = (node: HTMLElement | null) => {
        if (node) {
          targetMapRef.current[key] = node;
        } else {
          delete targetMapRef.current[key];
        }
      };
    }

    return refCallbackMapRef.current[key];
  }, []);

  const steps: TourProps["steps"] = useMemo(() => {
    if (!activeTourId) return [];
    return appTourGroups[activeTourId].map(({ key, ...step }) => ({
      ...step,
      target: (() => {
        return targetMapRef.current[key] ?? null;
      }) as TourStepProps["target"],
    }));
  }, [activeTourId]);

  const startTour = useCallback((tourId: TourId) => {
    setActiveTourId(tourId);
    setCurrent(0);
    setOpen(true);
  }, []);

  const closeTour = useCallback(() => {
    setOpen(false);
  }, []);

  const contextValue = useMemo<AppTourContextValue>(() => {
    return {
      startTour,
      closeTour,
      registerTarget,
    };
  }, [startTour, closeTour, registerTarget]);

  return (
    <AppTourContext.Provider value={contextValue}>
      {children}

      <Tour
        open={open}
        current={current}
        steps={steps}
        onChange={setCurrent}
        onClose={closeTour}
        onFinish={closeTour}
        scrollIntoViewOptions={{
          block: "center",
          behavior: "smooth",
        }}
        styles={{
          section:{
            maxWidth: "90vw",
          }
        }}
      />
    </AppTourContext.Provider>
  );
}

export function useAppTour() {
  const context = useContext(AppTourContext);

  if (!context) {
    throw new Error("useAppTour must be used inside AppTourProvider");
  }

  return context;
}
