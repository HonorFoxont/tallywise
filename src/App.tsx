import { RouterProvider } from 'react-router-dom';

import appRouter from '@/router/appRouter';

import { Provider } from './components/Provider';

function App() {
  return (
    <Provider>
      <RouterProvider router={appRouter} />
    </Provider>
  );
}

export default App;
