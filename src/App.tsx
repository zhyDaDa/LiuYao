import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Dialog, Toast } from "antd-mobile";
import { ArchiveEditModal } from "./components/ArchiveEditModal";
import { ArchiveModal } from "./components/ArchiveModal";
import { BottomNav } from "./components/BottomNav";
import { CastPopup } from "./components/CastPopup";
import { InfoDrawer, YaoDrawer } from "./components/YaoDrawer";
import { readArchive, writeArchive } from "./models/Archive";
import type { ChartSnapshot, YaoSnapshot } from "./models/Gua";
import { LiuYaoChart, Yao } from "./models/Gua";
import type { YaoPositionCategory } from "./models/YaoPositionImages";
import { DEFAULT_YAO_POSITION_CATEGORY } from "./models/YaoPositionImages";
import { ArchivePage } from "./pages/ArchivePage";
import { DivinePage } from "./pages/DivinePage";
import { HomePage } from "./pages/HomePage";
import { TablesPage } from "./pages/ReferencePage";
import type { CastInfo, CastSubmitPayload } from "./types/cast";
import type { PageKey } from "./types/navigation";

export type SimpleInfo = ReactNode | string | null;

function App() {
  const [activeKey, setActiveKey] = useState<PageKey>("home");
  const [chart, setChart] = useState<LiuYaoChart | null>(null);
  const [archive, setArchive] = useState<ChartSnapshot[]>(readArchive);
  const [selectedYao, setSelectedYao] = useState<YaoSnapshot | null>(null);
  const [simpleInfo, setSimpleInfo] = useState<SimpleInfo>(null);
  const [archivePreview, setArchivePreview] = useState<ChartSnapshot | null>(
    null,
  );
  const [archiveEdit, setArchiveEdit] = useState<ChartSnapshot | null>(null);
  const [castVisible, setCastVisible] = useState(false);
  const [useYaoPosition, setUseYaoPosition] = useState<number | null>(null);
  const [yaoPositionCategory, setYaoPositionCategory] =
    useState<YaoPositionCategory>(DEFAULT_YAO_POSITION_CATEGORY);
  const snapshot = useMemo(
    () =>
      chart ? chart.toSnapshot(useYaoPosition, yaoPositionCategory) : null,
    [chart, useYaoPosition, yaoPositionCategory],
  );

  function openCastPopup() {
    setCastVisible(true);
  }

  function closeCastPopup() {
    setCastVisible(false);
  }

  function castRandom(info: CastInfo) {
    const next = LiuYaoChart.random(info.question, info.castAt);
    setChart(next);
    setUseYaoPosition(null);
    setActiveKey("divine");
    setCastVisible(false);
    Toast.show({ content: "已完成一次自动起卦" });
  }

  function castManual(payload: CastSubmitPayload) {
    const yaos = payload.coinTotals.map(
      (total, position) =>
        new Yao(position, total % 2 === 1, total === 6 || total === 9),
    );
    const next = new LiuYaoChart(yaos, payload.question, payload.castAt);
    setChart(next);
    setUseYaoPosition(null);
    setActiveKey("divine");
    setCastVisible(false);
    Toast.show({ content: "已完成一次手动起卦" });
  }

  function saveCurrent() {
    if (!snapshot) {
      Toast.show({ content: "请先起卦再存档" });
      return;
    }
    saveSnapshot(snapshot);
  }

  function saveSnapshot(snapshot: ChartSnapshot) {
    const nextArchive = [
      snapshot,
      ...archive.filter((item) => item.id !== snapshot.id),
    ];
    setArchive(nextArchive);
    writeArchive(nextArchive);
    Toast.show({ content: "已保存到档案库" });
  }

  function renameCurrent(nextQuestion: string) {
    const question = nextQuestion.trim();

    if (!chart) return;

    if (!question) {
      Toast.show({ content: "排盘名称不能为空" });
      return;
    }

    const nextChart = new LiuYaoChart(
      chart.yaos,
      question,
      chart.createdAt,
      chart.id,
      chart.remark,
    );
    const nextSnapshot = nextChart.toSnapshot(
      useYaoPosition,
      yaoPositionCategory,
    );
    const nextArchive = archive.map((item) =>
      item.id === nextSnapshot.id ? nextSnapshot : item,
    );

    setChart(nextChart);
    setArchive(nextArchive);
    writeArchive(nextArchive);
    Toast.show({ content: "排盘名称已更新" });
  }

  function editCurrentRemark(nextRemark: string) {
    const remark = nextRemark.trim();

    if (!chart) return;

    const nextChart = new LiuYaoChart(
      chart.yaos,
      chart.question,
      chart.createdAt,
      chart.id,
      remark,
    );

    const nextSnapshot = nextChart.toSnapshot(
      useYaoPosition,
      yaoPositionCategory,
    );
    const nextArchive = archive.map((item) =>
      item.id === nextSnapshot.id ? nextSnapshot : item,
    );

    setChart(nextChart);
    setArchive(nextArchive);
    writeArchive(nextArchive);
    Toast.show({ content: "备注已更新" });
  }

  function loadArchive(item: ChartSnapshot) {
    setChart(LiuYaoChart.fromSnapshot(item));
    setUseYaoPosition(item.useYaoPosition ?? null);
    setYaoPositionCategory(
      item.yaoPositionCategory ?? DEFAULT_YAO_POSITION_CATEGORY,
    );
    setArchivePreview(null);
    setArchiveEdit(null);
    setActiveKey("divine");
    Toast.show({ content: "已读档到排盘页" });
  }

  function updateArchive(item: ChartSnapshot) {
    const nextArchive = archive.map((archiveItem) =>
      archiveItem.id === item.id ? item : archiveItem,
    );
    setArchive(nextArchive);
    writeArchive(nextArchive);
    setArchiveEdit(null);
    setArchivePreview((current) => (current?.id === item.id ? item : current));
    if (chart?.id === item.id) {
      setChart(LiuYaoChart.fromSnapshot(item));
      setYaoPositionCategory(
        item.yaoPositionCategory ?? DEFAULT_YAO_POSITION_CATEGORY,
      );
    }
    Toast.show({ content: "已更新历史排盘" });
  }

  async function deleteArchive(item: ChartSnapshot) {
    const confirmed = await Dialog.confirm({
      title: "删除存档",
      content: `确定删除「${item.question}」吗？`,
      confirmText: "删除",
      cancelText: "取消",
    });
    if (!confirmed) return;

    const nextArchive = archive.filter(
      (archiveItem) => archiveItem.id !== item.id,
    );
    setArchive(nextArchive);
    writeArchive(nextArchive);
    setArchivePreview((current) => (current?.id === item.id ? null : current));
    setArchiveEdit((current) => (current?.id === item.id ? null : current));
    Toast.show({ content: "已删除历史排盘" });
  }

  return (
    <div className={"app"}>
      <main className="app-main">
        {activeKey === "home" && <HomePage onCast={openCastPopup} />}
        {activeKey === "divine" && (
          <DivinePage
            snapshot={snapshot}
            onCast={openCastPopup}
            onSave={saveCurrent}
            onRename={renameCurrent}
            onEditRemark={editCurrentRemark}
            onInspect={setSelectedYao}
            onSimpleInfo={setSimpleInfo}
            onUseYao={setUseYaoPosition}
            yaoPositionCategory={yaoPositionCategory}
            onYaoPositionCategoryChange={setYaoPositionCategory}
          />
        )}
        {activeKey === "archive" && (
          <ArchivePage
            archive={archive}
            onPreview={setArchivePreview}
            onLoad={loadArchive}
            onEdit={setArchiveEdit}
            onDelete={deleteArchive}
            onSave={saveSnapshot}
          />
        )}
        {activeKey === "tables" && <TablesPage />}
      </main>

      <BottomNav activeKey={activeKey} onChange={setActiveKey} />
      <CastPopup
        visible={castVisible}
        onClose={closeCastPopup}
        onAutoCast={castRandom}
        onManualCast={castManual}
      />
      <YaoDrawer yao={selectedYao} onClose={() => setSelectedYao(null)} />
      <InfoDrawer info={simpleInfo} onClose={() => setSimpleInfo(null)} />
      <ArchiveModal
        item={archivePreview}
        onClose={() => setArchivePreview(null)}
        onLoad={loadArchive}
      />
      <ArchiveEditModal
        item={archiveEdit}
        onClose={() => setArchiveEdit(null)}
        onSave={updateArchive}
      />
    </div>
  );
}

export default App;
