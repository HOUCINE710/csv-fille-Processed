import React, { useState, useEffect } from "react";
import Papa from "papaparse";

const CSVUploader = () => {
  const [files, setFiles] = useState([]);
  const [pressure, setPressure] = useState("");
  const [error, setError] = useState("");
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    setTableData([]);
  }, []);

  const handleFileUpload = (event) => {
    setFiles([...event.target.files]);
  };

  const handleProcessResults = () => {
    if (!pressure) {
      setError("Please enter the minimum pressure value.");
      return;
    }
    setError("");
  
    if (files.length === 0) {
      setError("Please upload CSV files before processing.");
      return;
    }
  
    let allData = [...tableData];
  
    const filePromises = files.map((file) => {
      return new Promise((resolve) => {
        Papa.parse(file, {
          complete: (results) => {
            const data = results.data.slice(1).map((row) => {
              const eventPress = parseFloat(row[2]) || 0;
              const status = eventPress >= parseFloat(pressure) ? "Active" : "Inactive";
              return {
                key: row[0],
                pressureMeasurement: eventPress + " PSI",
                pressureMaxMeasurement: row[1] + " PSI",
                status: status,
                updatedBy: "",
                updatedDate: new Date().toISOString().split("T")[0],
                attachmentsIndicator: "0",
              };
            });
            allData = [...allData, ...data];
            resolve();
          },
          header: false,
        });
      });
    });
  
    Promise.all(filePromises).then(() => {
      setTableData(allData);
    });
  };

  const handleDownloadCSV = () => {
    if (tableData.length === 0) {
      setError("No data available to download.");
      return;
    }
    setError("");

    const csvData = [
      ["Key", "Press Measurement", "Pressure Max Measurement", "Status", "Updated By", "Updated Date", "Attachments Indicator"],
      ...tableData.map(row => [row.key, row.pressureMeasurement, row.pressureMaxMeasurement, row.status, row.updatedBy, row.updatedDate, row.attachmentsIndicator])
    ];

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Processed_Results.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="w-full p-6 bg-white shadow-lg rounded-lg space-y-6 text-left">
      <div className="flex flex-col items-start space-y-2">
        <label className="font-semibold">Step 1 : Orcanos Report ID :</label>
        <input type="text" className="border p-2 rounded w-full" />
      </div>

      <div className="flex flex-col items-start space-y-2">
        <label className="font-semibold">Step 2 : Upload Files :</label>
        <input
          type="file"
          multiple
          accept=".csv"
          onChange={handleFileUpload}
          className="border p-2 rounded w-full"
        />
      </div>

      <div className="flex flex-col items-start space-y-2">
        <label className="font-semibold">Step 3 : Set Minimum Pressure :</label>
        <input
          type="number"
          className="border p-2 rounded w-full"
          value={pressure}
          onChange={(e) => setPressure(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      <div className="flex flex-col items-start">
        <button
          onClick={handleProcessResults}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Process Results
        </button>
      </div>

      <div className="overflow-x-auto mt-6 w-full">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">Key</th>
              <th className="border border-gray-300 p-2">Press Measurement</th>
              <th className="border border-gray-300 p-2">Pressure Max Measurement</th>
              <th className="border border-gray-300 p-2">Status</th>
              <th className="border border-gray-300 p-2">Updated By</th>
              <th className="border border-gray-300 p-2">Updated Date</th>
              <th className="border border-gray-300 p-2">Attachments Indicator</th>
            </tr>
          </thead>
          <tbody>
            {tableData.length > 0 ? (
              tableData.map((row, index) => (
                <tr key={index} className="text-center">
                  <td className="border border-gray-300 p-2">{row.key}</td>
                  <td className="border border-gray-300 p-2">{row.pressureMeasurement}</td>
                  <td className="border border-gray-300 p-2">{row.pressureMaxMeasurement}</td>
                  <td className="border border-gray-300 p-2">{row.status}</td>
                  <td className="border border-gray-300 p-2">{row.updatedBy}</td>
                  <td className="border border-gray-300 p-2">{row.updatedDate}</td>
                  <td className="border border-gray-300 p-2">{row.attachmentsIndicator}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center p-4 text-gray-500">No results</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={handleDownloadCSV}
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
        >
          Upload Results
        </button>
      </div>
    </div>
  );
};

export default CSVUploader;
