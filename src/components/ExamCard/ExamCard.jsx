/** @format */

import React from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";

const ExamCard = ({
  _id,
  title,
  questionsCount,
  startTime,
  endTime,
  questions,
  type,
}) => {
  const navigate = useNavigate();

  const formattedStartTime = moment(startTime).format("MMM Do YYYY");

  const formattedEndTime = moment(endTime).format("MMM Do YYYY");

  const handleStartExam = () => {
    navigate(`/exams/${_id}`, {
      state: { title, questions },
    });
  };

  return (
    <div className="group relative bg-white border border-slate-200 rounded-[24px] p-5 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl overflow-hidden h-full flex flex-col">
      {/* Glow */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-100 rounded-full blur-3xl opacity-40 group-hover:scale-125 transition-all duration-500" />

      {/* Top */}
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />

            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Active Exam
            </span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 leading-tight line-clamp-2 max-w-[220px]">
            {title}
          </h2>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-2xl shadow-lg">
          📝
        </div>
      </div>

      {/* Middle */}
      <div className="relative z-10 mt-6 space-y-4 flex-1">
        {/* Questions */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase text-slate-500 tracking-wide">
              Questions
            </p>

            <h3 className="text-3xl font-bold text-slate-900 mt-1">
              {questionsCount}
            </h3>
          </div>

          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-xl">
            📚
          </div>
        </div>

        {/* Type */}
        <div className="bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl p-4 text-white">
          <p className="text-xs uppercase tracking-wide text-indigo-100">
            Exam Type
          </p>

          <h3 className="text-xl font-bold mt-1">{type || "Test"}</h3>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="border border-slate-200 rounded-2xl p-4 bg-white">
            <div className="text-xl mb-2">⏰</div>

            <p className="text-xs text-slate-500 uppercase tracking-wide">
              Start
            </p>

            <p className="font-semibold text-slate-800 mt-1 text-sm">
              {formattedStartTime}
            </p>
          </div>

          <div className="border border-slate-200 rounded-2xl p-4 bg-white">
            <div className="text-xl mb-2">📅</div>

            <p className="text-xs text-slate-500 uppercase tracking-wide">
              End
            </p>

            <p className="font-semibold text-slate-800 mt-1 text-sm">
              {formattedEndTime}
            </p>
          </div>
        </div>
      </div>

      {/* Button */}
      <button
        onClick={handleStartExam}
        className="relative z-10 mt-6 w-full bg-slate-900 hover:bg-indigo-600 text-white font-semibold py-4 rounded-2xl transition-all duration-300"
      >
        Start Exam →
      </button>
    </div>
  );
};

export default ExamCard;
