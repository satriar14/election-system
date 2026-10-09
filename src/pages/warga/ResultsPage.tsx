import React from "react";
import { LiveResultsView } from "../../components/warga/LiveResultsView";

export const ResultsPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F8F9FA] p-4 sm:p-8">
      <LiveResultsView />
    </div>
  );
};
