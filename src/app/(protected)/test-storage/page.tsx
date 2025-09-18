"use client";
import { useState, useEffect } from "react";

export default function TestStoragePage() {
  const [data, setData] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const stored = localStorage.getItem('test_data') || '[]';
      const parsed = JSON.parse(stored);
      setData(parsed);
      console.log("Loaded data:", parsed);
    } catch (error) {
      console.error("Error loading data:", error);
      setData([]);
    }
  };

  const saveData = () => {
    if (!inputValue.trim()) {
      setMessage("Please enter some data");
      return;
    }

    try {
      const newItem = {
        id: Date.now().toString(),
        value: inputValue,
        timestamp: new Date().toISOString()
      };

      const newData = [...data, newItem];
      localStorage.setItem('test_data', JSON.stringify(newData));
      setData(newData);
      setInputValue("");
      setMessage(`Saved successfully! Total items: ${newData.length}`);
      console.log("Saved data:", newData);
    } catch (error) {
      console.error("Error saving data:", error);
      setMessage("Error saving data");
    }
  };

  const clearData = () => {
    localStorage.removeItem('test_data');
    setData([]);
    setMessage("All data cleared");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Data Storage Test</h1>
      
      <div className="bg-blue-50 p-4 rounded mb-6">
        <h2 className="font-bold mb-2">Test localStorage Functionality</h2>
        <p className="text-sm text-gray-600">
          This page tests if localStorage is working properly in your browser.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block font-medium mb-2">Enter test data:</label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type anything here..."
            className="border rounded px-3 py-2 w-full max-w-md"
          />
        </div>

        <div className="space-x-2">
          <button
            onClick={saveData}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Save Data
          </button>
          <button
            onClick={loadData}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Reload Data
          </button>
          <button
            onClick={clearData}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Clear All
          </button>
        </div>

        {message && (
          <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-2 rounded">
            {message}
          </div>
        )}

        <div>
          <h3 className="font-bold mb-2">Stored Data ({data.length} items):</h3>
          {data.length === 0 ? (
            <p className="text-gray-500">No data stored yet. Try entering some data above.</p>
          ) : (
            <div className="space-y-2">
              {data.map((item, index) => (
                <div key={item.id} className="bg-gray-100 p-2 rounded">
                  <strong>#{index + 1}:</strong> {item.value} 
                  <span className="text-sm text-gray-500 ml-2">
                    ({new Date(item.timestamp).toLocaleString()})
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-yellow-50 p-4 rounded">
          <h4 className="font-bold mb-2">Debug Info:</h4>
          <p><strong>localStorage supported:</strong> {typeof(Storage) !== "undefined" ? "Yes" : "No"}</p>
          <p><strong>Current data count:</strong> {data.length}</p>
          <p><strong>Raw localStorage:</strong> <code>{localStorage.getItem('test_data') || 'null'}</code></p>
        </div>
      </div>
    </div>
  );
}
