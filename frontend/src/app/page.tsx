"use client";
import React from 'react';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-indigo-400 tracking-tight">AreaIQ Workspace</h1>
        <p className="text-slate-400 max-w-md mx-auto">
          Frontend architecture shell mounted successfully. Ready for shared microservice endpoint binding.
        </p>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800 text-emerald-400 rounded-full text-sm border border-slate-700">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Workspace Safe
        </div>
      </div>
    </main>
  );
}