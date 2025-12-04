import { ActiveView } from "@/types";
import { useIDE } from "@/hooks";

export function ActivityBarIcon({
    view,
    icon: Icon,
}: {
    view: ActiveView;
    icon: any;
}) {
    const { ui } = useIDE();
    const { activeView, setActiveView } = ui;

    return (
        <button
            onClick={() => setActiveView(activeView === view ? null : view)}
            className={`w-15 h-13 flex items-center justify-center transition-all border-l-2
        ${
            activeView === view
                ? "border-cryonx-accent text-white opacity-100"
                : "border-transparent text-gray-400 hover:text-white opacity-60 hover:opacity-100"
        }`}
        >
            <Icon strokeWidth={1.5} size={26} />
        </button>
    );
}
