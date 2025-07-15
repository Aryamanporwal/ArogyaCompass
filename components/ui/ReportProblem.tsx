import { useState } from "react";
import { Mail, ChevronDown, AlertCircle } from "lucide-react";

const reportOptions = [
  { value: "app", label: "Report problem in app" },
  { value: "hospital", label: "Report against a hospital" },
  { value: "lab", label: "Report against a lab" },
  { value: "assistant", label: "Report against an assistant" },
];

export default function ReportProblem() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(reportOptions[0]);
  const [description, setDescription] = useState("");

  const handleSendMail = (e: React.FormEvent) => {
    e.preventDefault();
    // Format mail content
    const subject = encodeURIComponent(`[ArogyaCompass Report] ${selectedType.label}`);
    const body = encodeURIComponent(
      `Problem Type: ${selectedType.label}\n\nDescription:\n${description}\n\n---\n(Auto-generated via ArogyaCompass Report Problem Page)`
    );
    window.location.href = `mailto:aryamanporwal@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <section className="w-full max-w-xl mx-auto px-3 py-8 rounded-2xl shadow-lg bg-white dark:bg-neutral-900 dark:text-gray-200">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <AlertCircle className="text-red-500 w-7 h-7" />
        <h1 className="text-2xl font-bold">Report a Problem</h1>
      </div>
      {/* Instructions */}
      <div className="mb-6 text-m text-gray-600 dark:text-gray-400">
        <ul className="list-disc pl-5 space-y-1 mb-2">
          <li>
            <span className="font-medium text-blue-600 dark:text-blue-400">ArogyaCompass assures your anonymity.</span>
          </li>
          <li>
            You can freely file a report here against a hospital, lab, assistant, or the app itself.
          </li>
          <li>
            Reports are received <span className="font-semibold text-blue-500">directly by the support team</span> and will be addressed promptly.
          </li>
          <li>
            <span className="font-bold text-green-600 dark:text-green-400">We are committed to improving your experience.</span>
          </li>
        </ul>
      </div>
      {/* Form */}
      <form onSubmit={handleSendMail} className="space-y-5">
        {/* Dropdown */}
        <div className="relative w-full">
          <button
            type="button"
            className="w-full flex items-center justify-between bg-gray-50 dark:bg-neutral-800 p-3 rounded-lg border border-gray-200 dark:border-neutral-700 hover:border-blue-400 transition"
            onClick={() => setDropdownOpen((v) => !v)}
          >
            <span>{selectedType.label}</span>
            <ChevronDown className={`w-5 h-5 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>
          {dropdownOpen && (
            <div className="absolute z-50 mt-1 w-full bg-white dark:bg-neutral-900 rounded-md border border-gray-200 dark:border-neutral-700 shadow-lg">
              {reportOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setSelectedType(option);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition rounded ${
                    selectedType.value === option.value ? "bg-blue-100 dark:bg-neutral-700 font-semibold" : ""
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        <textarea
          rows={5}
          placeholder="Describe your issue or concern..."
          className="w-full rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          required
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        {/* Send Button */}
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-full font-semibold shadow bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition"
        >
          <Mail className="w-5 h-5" />
          Send Report
        </button>
      </form>
    </section>
  );
}
