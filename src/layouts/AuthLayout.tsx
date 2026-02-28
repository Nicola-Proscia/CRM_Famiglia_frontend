import React from 'react';
import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md px-4 sm:px-0">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">CRM Familiare</h1>
          <p className="text-slate-500 mt-2 text-sm">Gestione finanze di famiglia</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
