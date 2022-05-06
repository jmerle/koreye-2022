import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { NotificationsProvider } from '@mantine/notifications';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { App } from './App';
import { HomePage } from './pages/home/HomePage';
import { KagglePage } from './pages/kaggle/KagglePage';
import { VisualizerPage } from './pages/visualizer/VisualizerPage';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider withNormalizeCSS={true}>
      <NotificationsProvider position="top-center">
        <ModalsProvider>
          <BrowserRouter basename="/koreye-2022">
            <Routes>
              <Route path="/" element={<App />}>
                <Route path="/" element={<HomePage />} />
                <Route path="visualizer" element={<VisualizerPage />} />
              </Route>
              <Route path="/kaggle" element={<KagglePage />} />
            </Routes>
          </BrowserRouter>
        </ModalsProvider>
      </NotificationsProvider>
    </MantineProvider>
  </React.StrictMode>,
);
