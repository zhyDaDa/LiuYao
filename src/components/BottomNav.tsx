import { TabBar } from "antd-mobile";
import type { PageKey } from "../types/navigation";
import { tabs } from "../types/navigation";
import { useAppTour } from "../tour/tourProvider";

export function BottomNav({
  activeKey,
  onChange,
}: {
  activeKey: PageKey;
  onChange: (key: PageKey) => void;
}) {
  const { registerTarget } = useAppTour();
  return (
    <footer className="bottom-nav">
      <TabBar
        activeKey={activeKey}
        onChange={(key) => onChange(key as PageKey)}
      >
        {tabs.map((item) => (
          <TabBar.Item
            key={item.key}
            title={item.title}
            icon={<span ref={registerTarget(item.tourKey)}>{item.icon}</span>}
          />
        ))}
      </TabBar>
    </footer>
  );
}
