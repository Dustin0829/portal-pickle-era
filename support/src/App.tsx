import { Routes, Route } from "react-router-dom";
import RootLayout from "@/layouts/RootLayout";
import { ActivityLogsPage } from "@/pages/activity-logs/ActivityLogsPage";
import { NotFoundPage } from "@/pages/not-found/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<ActivityLogsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
