'use client';

import { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import LoadingSpinner from '../../components/loading-spinner';

export default function Teams() {
  const [teams, setTeams] = useState({});
  const [activeTab, setActiveTab] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [username, setUsername] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [loginMode, setLoginMode] = useState(true); // true = login form, false = teams view
  const fileInputRef = useRef(null);

  // Load user data when the component mounts
  useEffect(() => {
    // Check for saved username in localStorage
    const savedUsername = localStorage.getItem('ipl_fantasy_username');
    if (savedUsername) {
      setUsername(savedUsername);
      
      // Auto-login if username exists
      (async () => {
        setIsLoading(true);
        try {
          const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: savedUsername }),
          });
          
          if (response.ok) {
            const { user } = await response.json();
            setCurrentUser(user);
            setLoginMode(false);
            await loadUserTeams(user.id);
          }
        } catch (error) {
          console.error('Auto-login error:', error);
          // Continue to login screen if auto-login fails
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, []);

  // Handle user login or registration
  const handleUserLogin = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      alert('Please enter a username');
      return;
    }

    setIsLoading(true);
    try {
      // Call the API to login or create user
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to login');
      }

      const { user } = await response.json();
      setCurrentUser(user);
      localStorage.setItem('ipl_fantasy_username', username);
      
      // Switch to teams view
      setLoginMode(false);
      
      // Load existing teams for this user
      await loadUserTeams(user.id);

    } catch (error) {
      console.error('Login error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Load teams for the current user
  const loadUserTeams = async (userId) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/teams?userId=${userId}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to load teams');
      }
      
      const { teams: userTeams } = await response.json();
      
      if (userTeams && Object.keys(userTeams).length > 0) {
        setTeams(userTeams);
        setActiveTab(Object.keys(userTeams)[0]);
      }
      
    } catch (error) {
      console.error('Error loading teams:', error);
      // Don't show an alert here, as empty teams is a valid state
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Excel file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Extract each sheet as a team
          const teamsData = {};
          workbook.SheetNames.forEach(sheetName => {
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet);
            
            // Check if there's data in the sheet
            if (jsonData.length > 0) {
              teamsData[sheetName] = jsonData;
            }
          });

          setTeams(teamsData);
          
          // Set first team as active tab if none selected
          if (Object.keys(teamsData).length > 0 && !activeTab) {
            setActiveTab(Object.keys(teamsData)[0]);
          }
          
          // Save the teams data to the database
          await saveTeamsToDatabase(teamsData);
          
        } catch (error) {
          console.error('Error parsing Excel file:', error);
          alert('Failed to parse the Excel file. Please ensure it is a valid Excel file.');
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('File reading error:', error);
      alert('Error reading the file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Save teams data to the database
  const saveTeamsToDatabase = async (teamsData) => {
    if (!currentUser) {
      console.error('No user logged in');
      return;
    }
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          teams: teamsData,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save teams');
      }
      
      alert('Teams saved successfully!');
      
    } catch (error) {
      console.error('Error saving teams:', error);
      alert(`Error saving teams: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTabClick = (teamName) => {
    setActiveTab(teamName);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setTeams({});
    setActiveTab('');
    setLoginMode(true);
    // Keep the username in the form for convenience
  };

  // Login screen
  if (loginMode) {
    return (
      <div className="container mx-auto p-6 max-w-md">
        <h1 className="text-3xl font-bold mb-8 text-center">Teams Login</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleUserLogin}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-gray-700 font-medium mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your username"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter a username to login or create a new account
              </p>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full ${
                isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              } text-white font-medium py-2 px-4 rounded-lg transition-colors flex justify-center items-center`}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Processing...</span>
                </>
              ) : (
                'Continue'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Teams view (after login)
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Teams</h1>
        
        <div className="flex items-center">
          <span className="text-gray-600 mr-4">
            Logged in as <span className="font-semibold">{username}</span>
          </span>
          <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </div>
      
      <div className="mb-8">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".xlsx, .xls"
          className="hidden"
        />
        <button
          onClick={triggerFileInput}
          disabled={isLoading || isSaving}
          className={`${
            isLoading || isSaving
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center`}
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">Processing...</span>
            </>
          ) : isSaving ? (
            <>
              <LoadingSpinner size="sm" />
              <span className="ml-2">Saving...</span>
            </>
          ) : (
            'Upload Excel File'
          )}
        </button>
        <p className="text-sm text-gray-600 mt-2">
          Upload an Excel file with different teams in separate sheets
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-16">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-600">Processing Excel file...</p>
        </div>
      ) : Object.keys(teams).length > 0 ? (
        <div>
          <div className="flex overflow-x-auto border-b border-gray-200 mb-6">
            {Object.keys(teams).map((teamName) => (
              <button
                key={teamName}
                onClick={() => handleTabClick(teamName)}
                className={`px-6 py-3 font-medium ${
                  activeTab === teamName
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                } transition-colors`}
              >
                {teamName}
              </button>
            ))}
          </div>

          {activeTab && (
            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200">
                    {teams[activeTab].length > 0 &&
                      Object.keys(teams[activeTab][0]).map((header) => (
                        <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          {header}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {teams[activeTab].map((player, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {Object.values(player).map((value, i) => (
                        <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-4 text-lg font-medium text-gray-700">No teams uploaded yet</p>
          <p className="mt-2 text-gray-500 max-w-md mx-auto">
            Please upload an Excel file where each sheet represents a team, with player information in rows.
          </p>
          <div className="mt-6 bg-white p-4 rounded border border-gray-200 max-w-lg mx-auto text-left">
            <p className="font-medium text-gray-700 mb-2">Excel Format Requirements:</p>
            <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
              <li>Create a separate sheet for each team</li>
              <li>Name each sheet with the team name (e.g., "Mumbai Indians", "Chennai Super Kings")</li>
              <li>First row should contain column headers (e.g., "Name", "Role", "Stats")</li>
              <li>Each subsequent row should contain player information</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}