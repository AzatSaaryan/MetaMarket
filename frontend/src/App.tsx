import { Header } from "./components/Header";

function App() {
  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <Header />
      <main className="p-4">{/* Остальной контент */}</main>
    </div>
  );
}

export default App;
