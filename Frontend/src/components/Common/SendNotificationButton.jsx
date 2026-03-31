import React, { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { getConditionsByModule } from "../../config/notificationConditions";
import { notificationService } from "../../services/notificationService";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getEmailFromRecord = (record, emailMap = {}) => {
  const studentObj = record?.stuID || record?.student;
  let studentDbId = "";

  if (typeof studentObj === "object" && studentObj?._id) {
    studentDbId = String(studentObj._id);
  } else if (typeof studentObj === "string") {
    studentDbId = String(studentObj);
  } else if (record?._id && !record?.stuID && !record?.student) {
    studentDbId = String(record._id); // In case record itself is a student document
  }

  let studentID = "";
  if (typeof studentObj === "object" && studentObj?.studentID) {
    studentID = String(studentObj.studentID);
  } else if (record?.studentID) {
    studentID = String(record.studentID);
  }

  return (
    record?.studentEmail ||
    record?.email ||
    record?.stuID?.email ||
    record?.student?.email ||
    (studentDbId ? emailMap[studentDbId] : "") ||
    (studentID ? emailMap[studentID] : "") ||
    ""
  );
};

export default function SendNotificationButton({
  moduleKey,
  records = [],
  emailMap = {},
  loadRecords,
  resolveEmailMap,
  disabled = false,
  onSent,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedConditionKey, setSelectedConditionKey] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingScope, setLoadingScope] = useState(false);
  const [scopedRecords, setScopedRecords] = useState(records);
  const [scopedEmailMap, setScopedEmailMap] = useState(emailMap);

  const conditions = useMemo(() => getConditionsByModule(moduleKey), [moduleKey]);

  const selectedCondition = useMemo(
    () => conditions.find((item) => item.key === selectedConditionKey) || null,
    [conditions, selectedConditionKey]
  );

  const filteredRecords = useMemo(() => {
    if (!selectedCondition) return [];
    return scopedRecords.filter((record) => selectedCondition.predicate(record));
  }, [scopedRecords, selectedCondition]);

  const recipients = useMemo(() => {
    const uniqueEmails = new Set();
    filteredRecords.forEach((record) => {
      const email = getEmailFromRecord(record, scopedEmailMap)?.trim();
      if (email && emailRegex.test(email)) {
        uniqueEmails.add(email.toLowerCase());
      }
    });
    return Array.from(uniqueEmails);
  }, [filteredRecords, scopedEmailMap]);

  const openModalAndPrepareData = async () => {
    setIsOpen(true);
    setSelectedConditionKey("");
    setSubject("");
    setMessage("");
    setScopedRecords(records);
    setScopedEmailMap(emailMap);

    if (!loadRecords) return;
    try {
      setLoadingScope(true);
      const allRecords = await loadRecords();
      const safeRecords = Array.isArray(allRecords) ? allRecords : [];
      setScopedRecords(safeRecords);

      if (resolveEmailMap) {
        const resolved = await resolveEmailMap(safeRecords);
        if (resolved && typeof resolved === "object") {
          setScopedEmailMap(resolved);
        }
      }
    } catch (err) {
      toast.error("Failed to load filtered records for notification.");
    } finally {
      setLoadingScope(false);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedConditionKey("");
    setSubject("");
    setMessage("");
  };

  const handleConditionChange = (key) => {
    setSelectedConditionKey(key);
    const condition = conditions.find((item) => item.key === key);
    if (condition) {
      setSubject(condition.templateSubject);
      setMessage(condition.templateMessage);
    } else {
      setSubject("");
      setMessage("");
    }
  };

  const handleSend = async () => {
    if (!selectedCondition) {
      toast.error("Please select a condition first.");
      return;
    }
    if (!subject.trim() || !message.trim()) {
      toast.error("Subject and message are required.");
      return;
    }
    if (recipients.length === 0) {
      toast.error("No valid recipient emails found for this condition.");
      return;
    }

    const confirmSend = window.confirm(
      `Send notification to ${recipients.length} students?`
    );
    if (!confirmSend) return;

    const toastId = toast.loading("Sending notifications...");
    try {
      setSending(true);
      await notificationService.sendBulkNotification({
        subject: subject.trim(),
        message: message.trim(),
        recipients,
      });
      toast.success("Notifications sent successfully.", { id: toastId });
      closeModal();
      onSent?.(recipients.length);
    } catch (err) {
      const errorMsg =
        err?.response?.data?.msg ||
        err?.response?.data?.message ||
        "Failed to send notifications.";
      toast.error(errorMsg, { id: toastId });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        onClick={openModalAndPrepareData}
        disabled={disabled}
        className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${
          disabled
            ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
            : "bg-indigo-600 text-white hover:bg-indigo-700"
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 8h10M7 12h6m-9 8h16a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        Send Notification
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                Send {moduleKey.charAt(0).toUpperCase() + moduleKey.slice(1)} Notification
              </h3>
              <button onClick={closeModal} className="p-2 rounded-full hover:bg-slate-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Condition
                </label>
                <select
                  value={selectedConditionKey}
                  onChange={(e) => handleConditionChange(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
                >
                  <option value="">Select condition</option>
                  {conditions.map((item) => (
                    <option key={item.key} value={item.key}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
                <p className="text-sm font-semibold text-indigo-700">
                  {loadingScope
                    ? "Loading filtered recipients..."
                    : `${recipients.length} students will receive this notification`}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
                  placeholder="Enter email subject"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Message
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
                  placeholder="Enter message"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending || loadingScope}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold text-white ${
                  sending || loadingScope
                    ? "bg-indigo-300 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {sending ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
