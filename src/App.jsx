import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UpdatedCode from './UpdatedCode';
import { Documentation } from './components/ui/Documentation';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route exact path="/" element={<UpdatedCode />} />
          <Route path="/docs" element={<Documentation />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
