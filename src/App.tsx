import { ThemeProvider } from './contexts/ThemeContext';
import { Dashboard } from './components/Dashboard';

function App() {
  return (
    <ThemeProvider>
      <Dashboard />
    </ThemeProvider>
  );
}

export default App
