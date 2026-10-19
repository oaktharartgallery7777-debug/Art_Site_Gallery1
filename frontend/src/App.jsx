import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import RequireAdmin from "./components/RequireAdmin";
import GalleryPage from "./pages/GalleryPage";
import ArtworkPage from "./pages/ArtworkPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/admin/DashboardPage";
import InventoryPage from "./pages/admin/InventoryPage";
import EditArtworkPage from "./pages/admin/EditArtworkPage";
import BulkImportPage from "./pages/admin/BulkImportPage";
import QRPage from "./pages/admin/QRPage";
import LabelsPage from "./pages/admin/LabelsPage";
import ActivityPage from "./pages/admin/ActivityPage";
import BatchLocationPage from "./pages/admin/BatchLocationPage";
import ReplaceImagePage from "./pages/admin/ReplaceImagePage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<GalleryPage />} />
                <Route path="/art/:id" element={<ArtworkPage />} />
                <Route path="/admin" element={<RequireAdmin><DashboardPage /></RequireAdmin>} />
                <Route path="/admin/inventory" element={<RequireAdmin><InventoryPage /></RequireAdmin>} />
                <Route path="/admin/edit" element={<RequireAdmin><EditArtworkPage /></RequireAdmin>} />
                <Route path="/admin/import" element={<RequireAdmin><BulkImportPage /></RequireAdmin>} />
                <Route path="/admin/qr" element={<RequireAdmin><QRPage /></RequireAdmin>} />
                <Route path="/admin/labels" element={<RequireAdmin><LabelsPage /></RequireAdmin>} />
                <Route path="/admin/activity" element={<RequireAdmin><ActivityPage /></RequireAdmin>} />
                <Route path="/admin/batch-location" element={<RequireAdmin><BatchLocationPage /></RequireAdmin>} />
                <Route path="/admin/replace-image" element={<RequireAdmin><ReplaceImagePage /></RequireAdmin>} />
                <Route path="*" element={<ArtworkPage />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
