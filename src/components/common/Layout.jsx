import Header from "./Header";

export default function Layout({ children }) {
  return (
    <div>
      <Header />
      <main style={{ padding: "20px" }}>{children}</main>
    </div>
  );
}