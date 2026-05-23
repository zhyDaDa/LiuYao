import { TabBar } from "antd-mobile";
import type { PageKey } from "../types/navigation";
import { tabs } from "../types/navigation";

export function BottomNav({
  activeKey,
  onChange,
}: {
  activeKey: PageKey;
  onChange: (key: PageKey) => void;
}) {
  return (
    <footer className="bottom-nav">
      <TabBar activeKey={activeKey} onChange={(key) => onChange(key as PageKey)}>
        {tabs.map((item) => (
          <TabBar.Item key={item.key} title={item.title} icon={<span>{item.icon}</span>} />
        ))}
      </TabBar>
    </footer>
  );
}
