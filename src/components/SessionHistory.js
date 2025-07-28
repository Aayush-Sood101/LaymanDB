"use client";

import React from 'react';
import { useSchemaContext } from '@/contexts/SchemaContext';

const SessionHistory = () => {
  const { 
    currentSession, 
    schemaHistory, 
    loadSchemaVersion,
    isLoading
  } = useSchemaContext();
  
  if (!currentSession || !schemaHistory || schemaHistory.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-blue-100 overflow-hidden animate-fade-in">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 py-3 px-5">
          <h2 className="text-lg font-bold text-white flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Version History
          </h2>
        </div>
        
        <div className="p-8 text-center">
          <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </div>
          <div className="text-gray-500 font-medium">
            No history yet
          </div>
          <p className="text-gray-400 text-sm mt-2">
            Generate a schema to start tracking versions
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md border border-blue-100 overflow-hidden animate-fade-in">
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 py-3 px-5 flex justify-between items-center">
        <h2 className="text-lg font-bold text-white flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Version History
        </h2>
        <span className="bg-white bg-opacity-20 text-white text-xs py-1 px-2 rounded-full">
          {schemaHistory.length} versions
        </span>
      </div>
      
      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        <div className="relative">
          <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-blue-200"></div>
          {schemaHistory.map((item) => (
            <div 
              key={item.schemaId}
              className={`p-4 cursor-pointer transition-all duration-200 border-l-4 hover:bg-blue-50 relative
                ${item.isActive ? 'border-l-blue-500 bg-blue-50' : 'border-l-transparent'}`}
              onClick={() => loadSchemaVersion(item.schemaId)}
            >
              <div className="flex items-center mb-1">
                <div className={`w-4 h-4 rounded-full z-10 ${item.isActive ? 'bg-blue-500' : 'bg-gray-300'} mr-3`}></div>
                <div className="font-medium text-gray-800">
                  Version {item.version}
                </div>
                {item.isActive && (
                  <span className="ml-2 bg-blue-100 text-blue-700 text-xs py-0.5 px-2 rounded">Current</span>
                )}
              </div>
              
              <div className="ml-7">
                <div className="text-xs text-gray-500 mb-1">
                  {new Date(item.timestamp).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 bg-white p-2 rounded border border-gray-100">
                  {item.comment || 'No description'}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {isLoading && (
          <div className="flex justify-center py-4">
            <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionHistory;
