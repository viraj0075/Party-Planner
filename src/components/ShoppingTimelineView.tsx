import React, { useState } from 'react';
import { TimelineStep } from '../types';
import {
  CalendarClock,
  CheckCircle2,
  Circle,
  Plus,
  Clock,
  Sparkles,
  ShoppingBag,
  Trash2,
} from 'lucide-react';

interface ShoppingTimelineViewProps {
  timeline: TimelineStep[];
  onToggleTask: (stepId: string, taskId: string) => void;
  onAddTask: (stepId: string, taskText: string) => void;
  onDeleteTask: (stepId: string, taskId: string) => void;
}

export const ShoppingTimelineView: React.FC<ShoppingTimelineViewProps> = ({
  timeline,
  onToggleTask,
  onAddTask,
  onDeleteTask,
}) => {
  const [addingToStepId, setAddingToStepId] = useState<string | null>(null);
  const [newTaskText, setNewTaskText] = useState('');

  const totalTasks = timeline.reduce((acc, step) => acc + step.tasks.length, 0);
  const completedTasks = timeline.reduce(
    (acc, step) => acc + step.tasks.filter((t) => t.completed).length,
    0
  );

  const handleCreateTask = (stepId: string) => {
    if (!newTaskText.trim()) return;
    onAddTask(stepId, newTaskText.trim());
    setNewTaskText('');
    setAddingToStepId(null);
  };

  const getTimeframeBadge = (timeframe: string) => {
    switch (timeframe) {
      case '2_weeks_prior':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', label: '2 Weeks Out' };
      case '1_week_prior':
        return { color: 'bg-indigo-100 text-indigo-800 border-indigo-200', label: '1 Week Out' };
      case '2_days_prior':
        return { color: 'bg-purple-100 text-purple-800 border-purple-200', label: '2 Days Out' };
      case '1_day_prior':
        return { color: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Day Before' };
      case 'day_of_morning':
        return { color: 'bg-rose-100 text-rose-800 border-rose-200', label: 'Party Morning' };
      default:
        return { color: 'bg-zinc-100 text-zinc-800 border-zinc-200', label: 'Phase' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Timeline Header Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-zinc-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarClock className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Run of Show Schedule
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900">
            Shopping & Host Prep Timeline
          </h2>
          <p className="text-xs text-zinc-500 mt-1 max-w-xl">
            Never scramble at the last minute. This phased timeline tells you exactly what to buy, order, prep, and chill ahead of time.
          </p>
        </div>

        <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 shrink-0 text-center sm:text-right">
          <div className="text-2xl font-black text-zinc-900">
            {completedTasks} / {totalTasks}
          </div>
          <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
            Prep Tasks Completed ({totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%)
          </div>
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-4">
        {timeline.map((step, idx) => {
          const badge = getTimeframeBadge(step.timeframe);
          const stepComplete =
            step.tasks.length > 0 && step.tasks.every((t) => t.completed);

          return (
            <div
              key={step.id}
              className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                stepComplete
                  ? 'border-emerald-200 bg-emerald-50/10'
                  : 'border-zinc-200 shadow-xs'
              }`}
            >
              <div className="p-4 sm:p-5 border-b border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-900 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}
                      >
                        {step.timeframeLabel || badge.label}
                      </span>
                      <h3 className="font-bold text-sm sm:text-base text-zinc-900">{step.title}</h3>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">{step.description}</p>
                  </div>
                </div>

                <button
                  type="button"
                  id={`add-task-btn-${step.id}`}
                  onClick={() => setAddingToStepId(step.id)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-200 transition-colors self-start sm:self-center"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Task</span>
                </button>
              </div>

              {/* Tasks Checklist */}
              <div className="p-4 sm:p-5 space-y-2.5">
                {step.tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border transition-all ${
                      task.completed
                        ? 'bg-zinc-50 border-zinc-200 opacity-70'
                        : 'bg-white border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <button
                      type="button"
                      id={`task-toggle-${task.id}`}
                      onClick={() => onToggleTask(step.id, task.id)}
                      className="flex items-center gap-3 text-left flex-1 min-w-0"
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          task.completed
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-zinc-300 bg-white'
                        }`}
                      >
                        {task.completed && <CheckCircle2 className="w-3 h-3" />}
                      </div>
                      <span
                        className={`text-xs sm:text-sm font-medium truncate ${
                          task.completed ? 'line-through text-zinc-400' : 'text-zinc-800'
                        }`}
                      >
                        {task.text}
                      </span>
                    </button>

                    <button
                      type="button"
                      id={`task-del-${task.id}`}
                      onClick={() => onDeleteTask(step.id, task.id)}
                      className="p-1 text-zinc-400 hover:text-rose-600 rounded transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {/* Inline Add Task Form */}
                {addingToStepId === step.id && (
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      id={`new-task-input-${step.id}`}
                      type="text"
                      autoFocus
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateTask(step.id)}
                      placeholder="Enter prep or shopping task..."
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      id={`save-task-btn-${step.id}`}
                      onClick={() => handleCreateTask(step.id)}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAddingToStepId(null);
                        setNewTaskText('');
                      }}
                      className="px-2.5 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-700"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
