import StatusMessage from "./StatusMessage";

export default function DataBoundary({
  loading = false,
  error = "",
  isEmpty = false,
  loadingTitle = "불러오는 중입니다.",
  loadingMessage = "잠시만 기다려 주세요.",
  errorTitle = "문제가 발생했습니다.",
  errorMessage,
  emptyTitle = "데이터가 없습니다.",
  emptyMessage = "표시할 내용이 없습니다.",
  emptyAction,
  children,
}) {
  if (loading) {
    return (
      <StatusMessage
        type="loading"
        title={loadingTitle}
        message={loadingMessage}
      />
    );
  }

  if (error) {
    return (
      <StatusMessage
        type="error"
        title={errorTitle}
        message={typeof error === "string" ? error : errorMessage}
      />
    );
  }

  if (isEmpty) {
    return (
      <StatusMessage
        type="empty"
        title={emptyTitle}
        message={emptyMessage}
        action={emptyAction}
      />
    );
  }

  return children;
}