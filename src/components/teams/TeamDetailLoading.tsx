
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import LoadingSpinner from "@/components/ui/loading-spinner";

export default function TeamDetailLoading() {
  return (
    <MainLayout>
      <LoadingSpinner />
    </MainLayout>
  );
}
