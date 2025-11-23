import React, { useState } from "react";

function App() {
  const [jobRole, setJobRole] = useState("");
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Extract JSON safely
  function extractJSON(text) {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? match[0] : null;
  }

  const handleSubmit = async () => {
    if (!jobRole || !resume) {
      alert("Please enter job role and upload your resume.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("job_role", jobRole);
    formData.append("resume", resume);

    try {
      const response = await fetch("http://127.0.0.1:8000/resume-analyzer", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      let cleaned = extractJSON(data.result);
      if (!cleaned) {
        alert("AI returned invalid JSON. Check backend response.");
        console.log(data.result);
        setLoading(false);
        return;
      }

      setResult(JSON.parse(cleaned));
    } catch (error) {
      alert("Backend error: " + error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-100 to-pink-100 p-6 flex justify-center items-center">
      <div className="max-w-2xl w-full bg-white shadow-xl rounded-2xl p-8">

        <h1 className="text-3xl font-bold text-center text-purple-500 mb-6">
          AI Resume Checker📄
        </h1>

        <div className="space-y-6">

          <div>
            <label className="block font-semibold text-gray-700 mb-2">
              Job Role
            </label>
            <input
              className="w-full p-3 rounded-xl bg-purple-50 border border-purple-200"
              placeholder="Software Engineer, Data Analyst, Senior Developer etc."
              onChange={(e) => setJobRole(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-2">
              Upload Resume (PDF / DOCX / TXT)
            </label>
            <input
              type="file"
              className="w-full p-3 rounded-xl bg-blue-50 border border-blue-200"
              accept=".pdf,.docx,.txt"
              onChange={(e) => setResume(e.target.files[0])}
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-pink-300 py-3 rounded-xl font-semibold text-gray-800"
          >
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>

        </div>

        {result && (
          <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6">

            <h2 className="text-xl font-bold text-green-600 mb-4">
              🌿 Analysis Result
            </h2>

            <p><strong>Status:</strong> {result.match_status}</p>
            <p className="mt-2"><strong>ATS Score:</strong> {result.ats_score}</p>

            <h3 className="font-semibold mt-4 text-purple-600">Recommended Jobs:</h3>
            <ul className="list-disc ml-6">
              {result.recommended_jobs.map((job, index) => (
                <li key={index}>{job}</li>
              ))}
            </ul>

            <h3 className="font-semibold mt-4 text-blue-600">Missing Keywords:</h3>
            <ul className="list-disc ml-6">
              {result.missing_keywords.map((kw, index) => (
                <li key={index}>{kw}</li>
              ))}
            </ul>

            <h3 className="font-semibold mt-4 text-green-600">
              ATS-Friendly Resume:
            </h3>
            <textarea
              className="w-full bg-green-200 p-3 rounded-xl resize-none mt-3"
              rows="5"
              readOnly
              value={result.ats_friendly_resume}
            ></textarea>

            <p className="mt-4 text-pink-600 font-semibold">{result.summary}</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
