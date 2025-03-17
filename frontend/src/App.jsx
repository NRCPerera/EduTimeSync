import { useEffect } from 'react';
import axios from 'axios';

function App() {
  useEffect(() => {
    axios.get('/api') // Use '/api' instead of just '/'
      .then(response => console.log(response.data))
      .catch(err => console.log(err));
  }, []);

  return <div>MERN App</div>;
}

export default App;