import AuthProvider from "./states/auth-provider"; // Import tanpa kurung kurawal
import AppRoutes from "./routes/app.routes";
import ErrorBoundary from "./states/error-boundary";
import "./App.css";
import "primeicons/primeicons.css";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="App">
          <AppRoutes />
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
