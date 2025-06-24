import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { cachedApiService } from './utils/apiCache'

// Start cache preloading immediately when the module loads
// Use the service directly so the promise is tracked properly
cachedApiService.preloadCache().catch(error => {
  console.error('❌ Cache preload failed:', error);
  // Don't throw the error - app should still work without cache
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
