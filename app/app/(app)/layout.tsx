import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { AuthGate } from "@/components/auth/AuthGate";
import { ModalProvider } from "@/contexts/ModalContext";
import { GroupsProvider } from "@/contexts/GroupsContext";
import { SearchProvider } from "@/contexts/SearchContext";
import { GlobalAddModal } from "@/components/subscriptions/GlobalAddModal";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <GroupsProvider>
      <SearchProvider>
      <ModalProvider>
        <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
          <Sidebar />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
            <Topbar />
            <main style={{ flex: 1, overflowY: "auto", padding: 24 }}>
              {children}
            </main>
          </div>
        </div>
        <GlobalAddModal />
      </ModalProvider>
      </SearchProvider>
      </GroupsProvider>
    </AuthGate>
  );
}
