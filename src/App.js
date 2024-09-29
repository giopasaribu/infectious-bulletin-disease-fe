// src/App.js
import GanttChart from './components/GanttChart';
import { Container } from 'react-bootstrap';
import './App.css';

const App = () => {
  return (
      <Container>
        <div className="mt-4">
          <GanttChart />
        </div>
      </Container>
  );
};

export default App;
