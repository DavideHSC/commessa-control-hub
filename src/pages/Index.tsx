
import React from 'react';
import Layout from '@/components/Layout';
import Dashboard from './Dashboard';
import Commesse from './Commesse';
import PrimaNota from './PrimaNota';
import Report from './Report';
import { useLocation } from 'react-router-dom';

const Index = () => {
  const location = useLocation();

  const renderContent = () => {
    switch (location.pathname) {
      case '/commesse':
        return <Commesse />;
      case '/prima-nota':
        return <PrimaNota />;
      case '/report':
        return <Report />;
      case '/impostazioni':
        return <div className="p-8 text-center">
          <h1 className="text-2xl font-bold">Impostazioni</h1>
          <p className="text-slate-600 mt-2">Sezione in sviluppo</p>
        </div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout>
      {renderContent()}
    </Layout>
  );
};

export default Index;
