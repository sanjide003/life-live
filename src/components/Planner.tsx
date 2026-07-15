import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckSquare, 
  Plus, 
  Trash2, 
  Award, 
  TrendingUp, 
  Calendar, 
  Target, 
  RefreshCw,
  Sparkles,
  Search,
  Filter,
  Edit2,
  Save,
  X,
  Clock,
  AlertCircle,
  Bell,
  Volume2,
  Smartphone,
  Repeat,
  Check,
  ChevronDown,
  BookOpen,
  Sprout,
  Flame,
  Settings
} from 'lucide-react';
import { LifeOSState, Task, Habit, Goal } from '../types';
import { getTranslation } from '../utils/translations';
import confetti from 'canvas-confetti';

interface PlannerProps {
  state: LifeOSState;
  onUpdateState: (newState: LifeOSState) => void;
  subTab?: 'tasks' | 'habits';
  onSubTabChange?: (tab: 'tasks' | 'habits') => void;
}

export default function Planner({ state, onUpdateState, subTab: externalSubTab, onSubTabChange }: PlannerProps) {
  const lang = state.language || 'en';
  const t = (key: any) => getTranslation(key, lang);
  const [localSubTab, setLocalSubTab] = useState<'tasks' | 'habits'>('tasks');
  const subTab = externalSubTab !== undefined ? externalSubTab : localSubTab;
  const setSubTab = (tab: 'tasks' | 'habits') => {
    if (onSubTabChange) {
      onSubTabChange(tab);
    } else {
      setLocalSubTab(tab);
    }
  };

  const [confirmState, setConfirmState] = useState<{
    title: string;
    message: string;
    consequence: string;
    onConfirm: () => void;
  } | null>(null);

  const translateCategory = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'personal': return lang === 'ml' ? 'വ്യക്തിപരം' : 'Personal';
      case 'work': return lang === 'ml' ? 'ജോലി' : 'Work';
      case 'health': return lang === 'ml' ? 'ആരോഗ്യം' : 'Health';
      case 'finance': return lang === 'ml' ? 'സാമ്പത്തികം' : 'Finance';
      case 'other': return lang === 'ml' ? 'മറ്റുള്ളവ' : 'Other';
      case 'all': return lang === 'ml' ? 'എല്ലാം' : 'All';
      default: return cat;
    }
  };

  // Dynamic Categories - merged from all current uses + default presets
  const predefinedCategories = ['Personal', 'Work', 'Health', 'Finance', 'Other'];
  const allCategories = Array.from(new Set([
    ...predefinedCategories,
    ...state.tasks.map(t => t.category),
    ...(state.habits.map(h => h.category).filter(Boolean) as string[]),
    ...state.goals.map(g => g.category)
  ]));
  
  // Generic Repeat Modal State Configuration
  const [repeatModalConfig, setRepeatModalConfig] = useState<{
    type: 'task' | 'habit' | 'goal';
    currentValue: 'Once' | 'Every day' | 'Monday to Friday' | 'Custom';
    currentDays: string[];
    onSave: (mode: 'Once' | 'Every day' | 'Monday to Friday' | 'Custom', days: string[]) => void;
  } | null>(null);
  
  // Task state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<string>('Personal');
  const [isCreatingCustomTaskCategory, setIsCreatingCustomTaskCategory] = useState(false);
  const [customTaskCategory, setCustomTaskCategory] = useState('');
  const [newTaskDate, setNewTaskDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTaskRepeat, setNewTaskRepeat] = useState<'Once' | 'Every day' | 'Monday to Friday' | 'Custom'>('Once');
  const [newTaskRepeatCustomDays, setNewTaskRepeatCustomDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [newTaskTime, setNewTaskTime] = useState('');
  const [newTaskAlarm, setNewTaskAlarm] = useState(false);
  const [newTaskAlarmType, setNewTaskAlarmType] = useState<'Vibration Only' | 'Ringtone Only' | 'Vibration & Ringtone'>('Vibration & Ringtone');

  // Task Search, Filters and Sorting
  const [taskSearch, setTaskSearch] = useState('');
  const [taskFilterCategory, setTaskFilterCategory] = useState<string>('All');
  const [taskSortOrder, setTaskSortOrder] = useState<'date-asc' | 'date-desc' | 'status'>('date-asc');

  // Alarm Settings Modal Configuration
  const [alarmModalConfig, setAlarmModalConfig] = useState<{
    enabled: boolean;
    time: string;
    type: 'Vibration Only' | 'Ringtone Only' | 'Vibration & Ringtone';
    onSave: (enabled: boolean, time: string, type: 'Vibration Only' | 'Ringtone Only' | 'Vibration & Ringtone') => void;
  } | null>(null);

  // Full Task Editing Modal State
  const [editingTaskData, setEditingTaskData] = useState<Task | null>(null);

  const handleStartEditTask = (task: Task) => {
    setEditingTaskData({ ...task });
  };

  const handleSaveEditTaskData = () => {
    if (!editingTaskData || !editingTaskData.title.trim()) return;
    const updatedTasks = state.tasks.map(t => {
      if (t.id === editingTaskData.id) {
        return editingTaskData;
      }
      return t;
    });
    onUpdateState({ ...state, tasks: updatedTasks });
    setEditingTaskData(null);
  };

  const handleCancelEditTask = () => {
    setEditingTaskData(null);
  };

  const filteredTasks = state.tasks
    .filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(taskSearch.toLowerCase());
      const matchesCategory = taskFilterCategory === 'All' || task.category === taskFilterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (taskSortOrder === 'date-asc') {
        return a.dueDate.localeCompare(b.dueDate);
      } else if (taskSortOrder === 'date-desc') {
        return b.dueDate.localeCompare(a.dueDate);
      } else {
        return (a.completed ? 1 : 0) - (b.completed ? 1 : 0);
      }
    });

  // Habit state
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitDescription, setNewHabitDescription] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState<string>('Personal');
  const [isCreatingCustomHabitCategory, setIsCreatingCustomHabitCategory] = useState(false);
  const [customHabitCategory, setCustomHabitCategory] = useState('');
  const [newHabitRepeat, setNewHabitRepeat] = useState<'Once' | 'Every day' | 'Monday to Friday' | 'Custom'>('Every day');
  const [newHabitRepeatCustomDays, setNewHabitRepeatCustomDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [newHabitAlarm, setNewHabitAlarm] = useState(false);
  const [newHabitTime, setNewHabitTime] = useState('');
  const [newHabitAlarmType, setNewHabitAlarmType] = useState<'Vibration Only' | 'Ringtone Only' | 'Vibration & Ringtone'>('Vibration & Ringtone');

  // Edit Habit state
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editHabitName, setEditHabitName] = useState('');
  const [editHabitDescription, setEditHabitDescription] = useState('');
  const [editHabitCategory, setEditHabitCategory] = useState<string>('Personal');
  const [isCreatingCustomEditHabitCategory, setIsCreatingCustomEditHabitCategory] = useState(false);
  const [customEditHabitCategory, setCustomEditHabitCategory] = useState('');
  const [editHabitRepeat, setEditHabitRepeat] = useState<'Once' | 'Every day' | 'Monday to Friday' | 'Custom'>('Every day');
  const [editHabitRepeatCustomDays, setEditHabitRepeatCustomDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [editHabitAlarm, setEditHabitAlarm] = useState(false);
  const [editHabitTime, setEditHabitTime] = useState('');
  const [editHabitAlarmType, setEditHabitAlarmType] = useState<'Vibration Only' | 'Ringtone Only' | 'Vibration & Ringtone'>('Vibration & Ringtone');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const handleOpenModal = () => setIsAddModalOpen(true);
    window.addEventListener('open-add-modal', handleOpenModal);
    return () => window.removeEventListener('open-add-modal', handleOpenModal);
  }, []);

  const handleCloseAddModal = () => setIsAddModalOpen(false);

  // 1. Task Operations
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const finalCategory = isCreatingCustomTaskCategory && customTaskCategory.trim() 
      ? customTaskCategory.trim() 
      : newTaskCategory;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      description: newTaskDescription.trim() || undefined,
      completed: false,
      dueDate: newTaskDate,
      category: finalCategory,
      dueTime: newTaskTime || undefined,
      alarmEnabled: newTaskAlarm && !!newTaskTime,
      repeat: newTaskRepeat,
      repeatCustomDays: newTaskRepeat === 'Custom' ? newTaskRepeatCustomDays : undefined,
      alarmType: newTaskAlarm && !!newTaskTime ? newTaskAlarmType : undefined,
    };

    onUpdateState({
      ...state,
      tasks: [newTask, ...state.tasks],
    });

    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskTime('');
    setNewTaskAlarm(false);
    setIsCreatingCustomTaskCategory(false);
    setCustomTaskCategory('');
    confetti({ particleCount: 40, spread: 30, origin: { y: 0.8 } });
  };

  const handleToggleTask = (taskId: string) => {
    const updatedTasks = state.tasks.map(t => {
      if (t.id === taskId) {
        const nextCompleted = !t.completed;
        if (nextCompleted) {
          confetti({ particleCount: 30, spread: 20, origin: { y: 0.8 } });
        }
        return { ...t, completed: nextCompleted };
      }
      return t;
    });

    onUpdateState({
      ...state,
      tasks: updatedTasks,
    });
  };

  const handleDeleteTask = (taskId: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    setConfirmState({
      title: 'Delete Task',
      message: `Are you sure you want to delete the task: "${task.title}"?`,
      consequence: 'This will permanently remove this task from your Daily Agenda and cannot be undone.',
      onConfirm: () => {
        onUpdateState({
          ...state,
          tasks: state.tasks.filter(t => t.id !== taskId),
        });
      }
    });
  };

  // 2. Habit Operations
  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    const finalCategory = isCreatingCustomHabitCategory && customHabitCategory.trim()
      ? customHabitCategory.trim()
      : newHabitCategory;

    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      name: newHabitName.trim(),
      description: newHabitDescription.trim() || undefined,
      frequency: newHabitRepeat === 'Once' ? 'Daily' : (newHabitRepeat === 'Monday to Friday' ? 'Daily' : (newHabitRepeat === 'Custom' ? 'Custom' : 'Daily')),
      repeat: newHabitRepeat,
      repeatCustomDays: newHabitRepeat === 'Custom' ? newHabitRepeatCustomDays : undefined,
      category: finalCategory,
      streak: 0,
      completions: [],
      targetCount: 1,
      dueTime: newHabitAlarm && newHabitTime ? newHabitTime : undefined,
      alarmEnabled: newHabitAlarm && !!newHabitTime,
      alarmType: newHabitAlarm && !!newHabitTime ? newHabitAlarmType : undefined,
    };

    onUpdateState({
      ...state,
      habits: [...state.habits, newHabit],
    });

    setNewHabitName('');
    setNewHabitDescription('');
    setNewHabitTime('');
    setNewHabitAlarm(false);
    setIsCreatingCustomHabitCategory(false);
    setCustomHabitCategory('');
    confetti({ particleCount: 40, spread: 40 });
  };

  const handleToggleHabitDate = (habitId: string, dateStr: string) => {
    const updatedHabits = state.habits.map(h => {
      if (h.id === habitId) {
        let completions = [...h.completions];
        let streak = h.streak;
        
        if (completions.includes(dateStr)) {
          // Remove completion
          completions = completions.filter(c => c !== dateStr);
          // Recalculate streak simply
          streak = Math.max(0, streak - 1);
        } else {
          // Add completion
          completions.push(dateStr);
          streak += 1;
          // Celebrate!
          confetti({ particleCount: 50, spread: 60, colors: ['#10b981', '#3b82f6', '#f59e0b'] });
        }

        return { ...h, completions, streak };
      }
      return h;
    });

    onUpdateState({
      ...state,
      habits: updatedHabits,
    });
  };

  const handleDeleteHabit = (habitId: string) => {
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return;
    setConfirmState({
      title: 'Delete Habit Loop',
      message: `Are you sure you want to delete the habit loop: "${habit.name}"?`,
      consequence: 'All streaking milestones and historic completion dates logged for this habit will be permanently deleted.',
      onConfirm: () => {
        onUpdateState({
          ...state,
          habits: state.habits.filter(h => h.id !== habitId),
        });
      }
    });
  };

  // 3. Habit Edit Operations
  const handleStartEditHabit = (habit: Habit) => {
    setEditingHabitId(habit.id);
    setEditHabitName(habit.name);
    setEditHabitDescription(habit.description || '');
    setEditHabitCategory(habit.category || 'Personal');
    setIsCreatingCustomEditHabitCategory(false);
    setCustomEditHabitCategory('');
    setEditHabitRepeat(habit.repeat || 'Every day');
    setEditHabitRepeatCustomDays(habit.repeatCustomDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
    setEditHabitAlarm(!!habit.alarmEnabled);
    setEditHabitTime(habit.dueTime || '');
    setEditHabitAlarmType(habit.alarmType || 'Vibration & Ringtone');
  };

  const handleSaveEditHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHabitId || !editHabitName.trim()) return;

    const finalCategory = isCreatingCustomEditHabitCategory && customEditHabitCategory.trim()
      ? customEditHabitCategory.trim()
      : editHabitCategory;

    const updatedHabits = state.habits.map(h => {
      if (h.id === editingHabitId) {
        return {
          ...h,
          name: editHabitName.trim(),
          description: editHabitDescription.trim() || undefined,
          repeat: editHabitRepeat,
          repeatCustomDays: editHabitRepeat === 'Custom' ? editHabitRepeatCustomDays : undefined,
          category: finalCategory,
          dueTime: editHabitAlarm && editHabitTime ? editHabitTime : undefined,
          alarmEnabled: editHabitAlarm && !!editHabitTime,
          alarmType: editHabitAlarm && !!editHabitTime ? editHabitAlarmType : undefined,
          frequency: editHabitRepeat === 'Once' ? 'Daily' as const : (editHabitRepeat === 'Monday to Friday' ? 'Daily' as const : (editHabitRepeat === 'Custom' ? 'Custom' as const : 'Daily' as const)),
        };
      }
      return h;
    });

    onUpdateState({
      ...state,
      habits: updatedHabits,
    });

    setEditingHabitId(null);
    confetti({ particleCount: 30, spread: 30 });
  };

  // 7-day list for habit completions tracker
  const getPastDays = (count: number) => {
    const days = [];
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  };
  const trackedDays = getPastDays(7);

  return (
    <div className="space-y-6" id="planner_root">
      {/* RENDER TASKS */}
      {subTab === 'tasks' && (
        <div className="flex flex-col gap-6" id="tasks_panel">
          {/* Active Tasks list at the top */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between min-h-[400px]">
            <div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                <h3 className="font-display font-semibold text-base text-slate-900 dark:text-slate-50">
                  {lang === 'ml' ? 'ടാസ്ക്കുകൾ' : 'Tasks'}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-full">
                    {lang === 'ml' ? 'കാണിക്കുന്നത്' : 'Shown'}: {filteredTasks.length} / {state.tasks.length}
                  </span>
                </div>
              </div>

              {filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="flex justify-center mb-2">
                    <Target className="h-10 w-10 text-slate-300 dark:text-slate-700 animate-pulse" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-2">
                    {lang === 'ml' ? 'യോജിക്കുന്ന പ്ലാനുകൾ ഇല്ല' : 'No Matching Plans'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {lang === 'ml' ? 'തിരച്ചിൽ മാറ്റുകയോ അല്ലെങ്കിൽ കാറ്റഗറി മാറ്റുകയോ ചെയ്യുക' : 'Try resetting search string or category filters'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] md:max-h-[500px] overflow-y-auto pr-1 overflow-x-hidden">
                  <AnimatePresence>
                  {filteredTasks.map((task) => {
                    return (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="relative group rounded-xl overflow-hidden"
                      >
                        {/* Background delete indicator for swipe */}
                        <div className="absolute inset-0 bg-rose-500 flex justify-end items-center px-4 rounded-xl">
                          <Trash2 className="h-5 w-5 text-white" />
                        </div>
                        
                        <motion.div 
                          drag="x"
                          dragConstraints={{ left: 0, right: 0 }}
                          dragElastic={{ left: 0.5, right: 0 }}
                          onDragEnd={(e, { offset, velocity }) => {
                            if (offset.x < -80 || velocity.x < -500) {
                              handleDeleteTask(task.id);
                            }
                          }}
                          className={`relative flex items-start gap-3 p-3.5 rounded-xl border transition-all h-full z-10 w-full ${
                            task.completed 
                              ? 'bg-slate-50 dark:bg-slate-850/95 border-slate-100 dark:border-slate-800/50 text-slate-400' 
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => handleToggleTask(task.id)}
                            className="h-4.5 w-4.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0 mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold tracking-tight leading-snug truncate ${task.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-50'}`}>
                                  {task.title}
                                </p>
                                {task.description && (
                                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed truncate">
                                    {task.description}
                                  </p>
                                )}
                                <div className="flex flex-wrap items-center gap-1 mt-1.5 text-slate-500 dark:text-slate-400">
                                  <span className="text-[9px] uppercase font-bold tracking-wider px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 dark:text-slate-300 truncate max-w-[80px]">
                                    {translateCategory(task.category)}
                                  </span>
                                  {task.dueTime && (
                                    <>
                                      <span className="text-[10px] font-mono text-slate-400">•</span>
                                      <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-extrabold flex items-center gap-0.5">
                                        <Clock className="h-3 w-3 shrink-0" /> {task.dueTime}
                                      </span>
                                    </>
                                  )}
                                  {task.alarmEnabled && (
                                    <span className="inline-flex items-center gap-0.5 px-1 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded text-[9px] font-bold">
                                      <Bell className="h-2.5 w-2.5 shrink-0" /> {task.alarmType === 'Vibration Only' ? 'Vib' : task.alarmType === 'Ringtone Only' ? 'Ring' : 'Both'}
                                    </span>
                                  )}
                                </div>
                          </div>
                          
                          <div className="flex flex-col items-center justify-between shrink-0 h-full">
                            {!task.completed && (
                              <button
                                onClick={() => handleStartEditTask(task)}
                                className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {/* Explicit delete button for non-swipe users */}
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors cursor-pointer mt-auto"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                  </AnimatePresence>
                </div>
              )}

              {/* Search, Filter, Sort Controls (moved to the bottom for mobile thumb accessibility) */}
              <div className="space-y-3 mt-5 bg-slate-50/50 dark:bg-slate-800/20 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder={lang === 'ml' ? 'തിരയുക...' : 'Search tasks...'}
                      value={taskSearch}
                      onChange={(e) => setTaskSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 font-medium text-slate-800 dark:text-slate-150"
                    />
                  </div>

                  {/* Filter select category */}
                  <div>
                    <select
                      value={taskFilterCategory}
                      onChange={(e) => setTaskFilterCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 font-semibold text-slate-700 dark:text-slate-300"
                    >
                      <option value="All">{lang === 'ml' ? 'എല്ലാ വിഭാഗങ്ങളും' : 'All Categories'}</option>
                      {allCategories.map(cat => (
                        <option key={cat} value={cat}>{translateCategory(cat)}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sorting Select */}
                  <div>
                    <select
                      value={taskSortOrder}
                      onChange={(e) => setTaskSortOrder(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 font-semibold text-slate-700 dark:text-slate-300"
                    >
                      <option value="date-asc">{lang === 'ml' ? 'തീയതി ക്രമത്തിൽ (ആദ്യം)' : 'Date Ascending'}</option>
                      <option value="date-desc">{lang === 'ml' ? 'തീയതി ക്രമത്തിൽ (അവസാനം)' : 'Date Descending'}</option>
                      <option value="status">{lang === 'ml' ? 'തീരാത്തവ ആദ്യം' : 'Uncompleted First'}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Create Task Form below */}
          <div className={`${isAddModalOpen ? 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in' : 'hidden lg:block'}`}>
            <div className={`bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative ${isAddModalOpen ? 'w-full max-w-md rounded-3xl shadow-2xl animate-scale-up max-h-[85vh] overflow-y-auto' : 'rounded-2xl h-fit'}`}>
              {isAddModalOpen && (
                <button onClick={handleCloseAddModal} className="absolute top-5 right-5 p-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500">
                  <X className="h-4 w-4" />
                </button>
              )}
              <h3 className="font-display font-semibold text-base text-slate-900 dark:text-slate-50 mb-4 flex items-center gap-2">
                <Plus className="h-5 w-5 text-indigo-600" /> {lang === 'ml' ? 'പുതിയ ടാസ്ക് ചേർക്കുക' : 'Add Task'}
              </h3>
              <form onSubmit={(e) => { handleAddTask(e); handleCloseAddModal(); }} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  {lang === 'ml' ? 'ടാസ്ക് പേര്' : 'Task Title'}
                </label>
                <input
                  type="text"
                  placeholder={lang === 'ml' ? 'ഉദാ: ജോലി ആവശ്യങ്ങൾ, വ്യായാമം ചെയ്യുക...' : 'e.g. Work presentation, Gym workout, Hydrate...'}
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  {lang === 'ml' ? 'വിവരണം' : 'Description'}
                </label>
                <textarea
                  placeholder={lang === 'ml' ? 'കൂടുതൽ വിവരങ്ങൾ ഇവിടെ എഴുതാം...' : 'Provide useful notes or specific description details...'}
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Category Selection Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    {lang === 'ml' ? 'വിഭാഗം' : 'Category'}
                  </label>
                  <select
                    value={isCreatingCustomTaskCategory ? 'CREATE_NEW' : newTaskCategory}
                    onChange={(e) => {
                      if (e.target.value === 'CREATE_NEW') {
                        setIsCreatingCustomTaskCategory(true);
                      } else {
                        setIsCreatingCustomTaskCategory(false);
                        setNewTaskCategory(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-200 font-semibold"
                  >
                    {allCategories.map(cat => (
                      <option key={cat} value={cat}>{translateCategory(cat)}</option>
                    ))}
                    <option value="CREATE_NEW">{lang === 'ml' ? '+ പുതിയ വിഭാഗം നിർമ്മിക്കുക' : '+ Create New Category'}</option>
                  </select>

                  {isCreatingCustomTaskCategory && (
                    <input
                      type="text"
                      placeholder={lang === 'ml' ? 'വിഭാഗത്തിന്റെ പേര് എഴുതുക...' : 'Enter custom category name...'}
                      value={customTaskCategory}
                      onChange={(e) => setCustomTaskCategory(e.target.value)}
                      className="w-full mt-2 px-3.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-indigo-300 dark:border-indigo-800 rounded-lg focus:outline-none text-slate-900 dark:text-slate-100 font-medium animate-fade-in"
                      required
                    />
                  )}
                </div>

                {/* Repeat Select Button Modal Trigger */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    {lang === 'ml' ? 'ആവർത്തനം' : 'Repeat Cycle'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setRepeatModalConfig({
                      type: 'task',
                      currentValue: newTaskRepeat,
                      currentDays: newTaskRepeatCustomDays,
                      onSave: (mode, days) => {
                        setNewTaskRepeat(mode);
                        setNewTaskRepeatCustomDays(days);
                      }
                    })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none hover:border-indigo-500 text-left text-slate-800 dark:text-slate-200 font-bold flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <Repeat className="h-4 w-4 text-emerald-500" />
                      {newTaskRepeat === 'Custom' 
                        ? (lang === 'ml' ? `കസ്റ്റം (${newTaskRepeatCustomDays.length} ദിവസങ്ങൾ)` : `Custom (${newTaskRepeatCustomDays.length} days)`) 
                        : newTaskRepeat === 'Once'
                        ? (lang === 'ml' ? 'ഒരു തവണ' : 'Once')
                        : newTaskRepeat === 'Every day'
                        ? (lang === 'ml' ? 'എല്ലാ ദിവസവും' : 'Every day')
                        : newTaskRepeat === 'Monday to Friday'
                        ? (lang === 'ml' ? 'തിങ്കൾ മുതൽ വെള്ളി വരെ' : 'Monday to Friday')
                        : newTaskRepeat
                      }
                    </span>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Start Date Selection (Styled beautifully alongside Repeat) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                  {lang === 'ml' ? 'തുടങ്ങുന്ന തീയതി' : 'Start Date'}
                </label>
                <input
                  type="date"
                  value={newTaskDate}
                  onChange={(e) => setNewTaskDate(e.target.value)}
                  className="w-full max-w-xs px-3.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-800 dark:text-slate-150"
                  required
                />
              </div>

              {/* Optional Alarm settings - Replaced with Modal button */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  {lang === 'ml' ? 'അലാറം ക്രമീകരണങ്ങൾ' : 'Alarm Settings'}
                </label>
                <button
                  type="button"
                  onClick={() => setAlarmModalConfig({
                    enabled: newTaskAlarm,
                    time: newTaskTime,
                    type: newTaskAlarmType,
                    onSave: (enabled, time, type) => {
                      setNewTaskAlarm(enabled);
                      setNewTaskTime(time);
                      setNewTaskAlarmType(type);
                    }
                  })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none hover:border-indigo-500 text-left text-slate-800 dark:text-slate-200 font-bold flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Bell className={`h-4 w-4 ${newTaskAlarm ? 'text-indigo-600' : 'text-slate-400'}`} />
                    {newTaskAlarm && newTaskTime ? `${newTaskTime} (${newTaskAlarmType})` : (lang === 'ml' ? 'അലാറം ചേർക്കുക' : 'Configure Alarm')}
                  </span>
                  <Settings className="h-4 w-4 text-slate-400" />
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="h-4 w-4" /> {lang === 'ml' ? 'പ്ലാൻ ചേർക്കുക' : 'Add Task Plan'}
              </button>
            </form>
          </div>
        </div>
          </div>
      )}

      {/* RENDER HABITS */}
      {subTab === 'habits' && (
        <div className="flex flex-col gap-6" id="habits_panel">
          {/* Active Habits list at the top */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[400px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-base text-slate-900 dark:text-slate-50">
                {lang === 'ml' ? 'ശീലങ്ങൾ' : 'Habits'}
              </h3>
              <span className="text-xs font-mono text-emerald-600 flex items-center gap-1">
                <Award className="h-3.5 w-3.5" /> {lang === 'ml' ? 'ശീലങ്ങൾ സജീവമാണ്' : 'High Streaks Enabled'}
              </span>
            </div>

            {state.habits.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex justify-center mb-2">
                  <Sprout className="h-10 w-10 text-slate-300 dark:text-slate-700 animate-pulse" />
                </div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-2">
                  {lang === 'ml' ? 'ശീലങ്ങൾ ഒന്നും തന്നെ ചേർത്തിട്ടില്ല' : 'No Habits'}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {lang === 'ml' ? 'ദിവസേനയുള്ള ശീലങ്ങൾ ചെയ്ത് തുടങ്ങുക' : 'Strengthen consistency by tracking daily habit nodes'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {state.habits.map((habit) => (
                  <div key={habit.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-indigo-100 dark:hover:border-indigo-950 transition-colors bg-white dark:bg-slate-900">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-50 flex flex-wrap items-center gap-2">
                          <span className="truncate max-w-[150px] sm:max-w-[200px] inline-block">{habit.name}</span>
                          {habit.category && (
                            <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 dark:text-slate-300">
                              {translateCategory(habit.category)}
                            </span>
                          )}
                          <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">
                            {habit.repeat === 'Custom' 
                              ? (lang === 'ml' ? `കസ്റ്റം (${habit.repeatCustomDays?.join(', ')})` : `Custom (${habit.repeatCustomDays?.join(', ')})`) 
                              : habit.repeat === 'Once'
                              ? (lang === 'ml' ? 'ഒരു തവണ' : 'Once')
                              : habit.repeat === 'Every day' || !habit.repeat
                              ? (lang === 'ml' ? 'എല്ലാ ദിവസവും' : 'Every day')
                              : habit.repeat === 'Monday to Friday'
                              ? (lang === 'ml' ? 'തിങ്കൾ മുതൽ വെള്ളി വരെ' : 'Monday to Friday')
                              : habit.repeat
                            }
                          </span>
                        </h4>
                        {habit.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {habit.description}
                          </p>
                        )}
                        <p className="text-xs text-slate-400 mt-0.5 font-medium flex items-center gap-1">
                          <span>
                            {lang === 'ml' 
                              ? `തുടർച്ചയായ ആവർത്തനം: ${habit.streak} ദിവസങ്ങൾ` 
                              : `Consecutive Stream: ${habit.streak} days streak`
                            }
                          </span>
                          <Flame className="h-3.5 w-3.5 text-orange-500 fill-orange-500 animate-pulse shrink-0" />
                        </p>
                        {habit.alarmEnabled && habit.dueTime && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 mt-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded text-[9px] font-bold">
                            <Bell className="h-2.5 w-2.5 inline shrink-0" /> {lang === 'ml' ? `അലാറം സജീവമാണ്: ${habit.dueTime}` : `Alarm Active: ${habit.dueTime} (${habit.alarmType || 'Ringtone & Vibration'})`}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleStartEditHabit(habit)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors cursor-pointer"
                          title="Edit Habit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteHabit(habit.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-450 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                          title="Delete Habit"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Weekly calendar check boxes */}
                    <div className="grid grid-cols-7 gap-1 bg-slate-50 dark:bg-slate-850/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      {trackedDays.map((day) => {
                        const isCompleted = habit.completions.includes(day);
                        const dayObj = new Date(day);
                        const label = dayObj.toLocaleDateString('en-US', { weekday: 'narrow' });
                        const shortDate = dayObj.toLocaleDateString('en-US', { day: 'numeric' });
                        const mlDays = ['ഞാ', 'തി', 'ചൊ', 'ബു', 'വ്യാ', 'വെ', 'ശ'];
                        const dayName = lang === 'ml' ? mlDays[dayObj.getDay()] : label;
                        
                        return (
                          <button
                            key={day}
                            onClick={() => handleToggleHabitDate(habit.id, day)}
                            className={`flex flex-col items-center py-1.5 rounded-lg border transition-all cursor-pointer ${
                              isCompleted 
                                ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm' 
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <span className="text-[10px] font-bold block opacity-75">{dayName}</span>
                            <span className="text-xs font-mono font-bold mt-0.5">{shortDate}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create Habit Form below */}
          <div className={`${isAddModalOpen ? 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in' : 'hidden lg:block'}`}>
            <div className={`bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative ${isAddModalOpen ? 'w-full max-w-md rounded-3xl shadow-2xl animate-scale-up max-h-[85vh] overflow-y-auto' : 'rounded-2xl h-fit'}`}>
              {isAddModalOpen && (
                <button onClick={handleCloseAddModal} className="absolute top-5 right-5 p-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500">
                  <X className="h-4 w-4" />
                </button>
              )}
              <h3 className="font-display font-semibold text-base text-slate-900 dark:text-slate-50 mb-4 flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-indigo-600 animate-spin-slow" /> {lang === 'ml' ? 'പുതിയ ശീലം ചേർക്കുക' : 'Add Habit'}
              </h3>
              <form onSubmit={(e) => { handleAddHabit(e); handleCloseAddModal(); }} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  {lang === 'ml' ? 'ശീലത്തിന്റെ പേര്' : 'Habit Name'}
                </label>
                <input
                  type="text"
                  placeholder={lang === 'ml' ? 'ഉദാ: നടക്കുക, ഖുർആൻ ഓതുക, കോഡിങ്...' : 'e.g. 10k steps, Read Quran, Code for 1 hour...'}
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  {lang === 'ml' ? 'വിവരണം' : 'Description'}
                </label>
                <textarea
                  placeholder={lang === 'ml' ? 'ഉദാ: രാവിലെ എഴുന്നേറ്റയുടൻ ചെയ്യാൻ ശ്രദ്ധിക്കുക...' : 'e.g. Do this right after waking up to build muscle memory...'}
                  value={newHabitDescription}
                  onChange={(e) => setNewHabitDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Category Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    {lang === 'ml' ? 'വിഭാഗം' : 'Category'}
                  </label>
                  <select
                    value={isCreatingCustomHabitCategory ? 'CREATE_NEW' : newHabitCategory}
                    onChange={(e) => {
                      if (e.target.value === 'CREATE_NEW') {
                        setIsCreatingCustomHabitCategory(true);
                      } else {
                        setIsCreatingCustomHabitCategory(false);
                        setNewHabitCategory(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-200 font-semibold"
                  >
                    {allCategories.map(cat => (
                      <option key={cat} value={cat}>{translateCategory(cat)}</option>
                    ))}
                    <option value="CREATE_NEW">{lang === 'ml' ? '+ പുതിയ വിഭാഗം നിർമ്മിക്കുക' : '+ Create New Category'}</option>
                  </select>

                  {isCreatingCustomHabitCategory && (
                    <input
                      type="text"
                      placeholder={lang === 'ml' ? 'വിഭാഗത്തിന്റെ പേര് എഴുതുക...' : 'Enter custom category name...'}
                      value={customHabitCategory}
                      onChange={(e) => setCustomHabitCategory(e.target.value)}
                      className="w-full mt-2 px-3.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-indigo-300 dark:border-indigo-800 rounded-lg focus:outline-none text-slate-900 dark:text-slate-100 font-medium animate-fade-in"
                      required
                    />
                  )}
                </div>

                {/* Repeat select trigger */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    {lang === 'ml' ? 'ആവർത്തനം' : 'Repeat Cycle'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setRepeatModalConfig({
                      type: 'habit',
                      currentValue: newHabitRepeat,
                      currentDays: newHabitRepeatCustomDays,
                      onSave: (mode, days) => {
                        setNewHabitRepeat(mode);
                        setNewHabitRepeatCustomDays(days);
                      }
                    })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none hover:border-indigo-500 text-left text-slate-800 dark:text-slate-200 font-bold flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <Repeat className="h-4 w-4 text-emerald-500" />
                      {newHabitRepeat === 'Custom' 
                        ? (lang === 'ml' ? `കസ്റ്റം (${newHabitRepeatCustomDays.length} ദിവസങ്ങൾ)` : `Custom (${newHabitRepeatCustomDays.length} days)`) 
                        : newHabitRepeat === 'Once'
                        ? (lang === 'ml' ? 'ഒരു തവണ' : 'Once')
                        : newHabitRepeat === 'Every day'
                        ? (lang === 'ml' ? 'എല്ലാ ദിവസവും' : 'Every day')
                        : newHabitRepeat === 'Monday to Friday'
                        ? (lang === 'ml' ? 'തിങ്കൾ മുതൽ വെള്ളി വരെ' : 'Monday to Friday')
                        : newHabitRepeat
                      }
                    </span>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Optional Alarm settings */}
              <div className="bg-slate-50/50 dark:bg-slate-800/20 p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={newHabitAlarm}
                      onChange={(e) => setNewHabitAlarm(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer h-4 w-4"
                    />
                    <span className="flex items-center gap-1">
                      <Bell className={`h-4 w-4 ${newHabitAlarm ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                      {lang === 'ml' ? 'അലാറം ഓർമ്മപ്പെടുത്തൽ വേണോ?' : 'Enable Alarm Reminder?'}
                    </span>
                  </label>
                </div>

                {newHabitAlarm && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/50 animate-fade-in">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        {lang === 'ml' ? 'അലാറം സമയം' : 'Alarm Time'}
                      </label>
                      <input
                        type="time"
                        value={newHabitTime}
                        onChange={(e) => setNewHabitTime(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none font-mono text-slate-800 dark:text-slate-100"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        {lang === 'ml' ? 'അലാറം രീതി' : 'Alarm Feedback Mode'}
                      </label>
                      <select
                        value={newHabitAlarmType}
                        onChange={(e) => setNewHabitAlarmType(e.target.value as any)}
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none font-semibold text-slate-850 dark:text-slate-200"
                      >
                        <option value="Vibration Only">{lang === 'ml' ? 'വൈബ്രേഷൻ മാത്രം' : 'Vibration Only'}</option>
                        <option value="Ringtone Only">{lang === 'ml' ? 'റിംഗ്‌ടോൺ മാത്രം' : 'Ringtone Only'}</option>
                        <option value="Vibration & Ringtone">{lang === 'ml' ? 'വൈബ്രേഷനും റിംഗ്‌ടോണും' : 'Vibration & Ringtone'}</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="h-4 w-4" /> {lang === 'ml' ? 'ശീലം ചേർക്കുക' : 'Add Habit Loop'}
              </button>
            </form>
          </div>
          </div>
        </div>
      )}

      {/* Edit Habit Modal Popup */}
      {editingHabitId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-scale-up text-left overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Edit2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900 dark:text-slate-50 tracking-tight">
                    Edit Habit
                  </h3>
                  <p className="text-[10px] text-slate-500">Update your routine configurations</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingHabitId(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditHabit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Habit Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10k steps, Read Quran..."
                  value={editHabitName}
                  onChange={(e) => setEditHabitName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  placeholder="e.g. Do this right after waking up..."
                  value={editHabitDescription}
                  onChange={(e) => setEditHabitDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Category dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={isCreatingCustomEditHabitCategory ? 'CREATE_NEW' : editHabitCategory}
                    onChange={(e) => {
                      if (e.target.value === 'CREATE_NEW') {
                        setIsCreatingCustomEditHabitCategory(true);
                      } else {
                        setIsCreatingCustomEditHabitCategory(false);
                        setEditHabitCategory(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-200 font-semibold"
                  >
                    {allCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="CREATE_NEW">+ Create New Category</option>
                  </select>

                  {isCreatingCustomEditHabitCategory && (
                    <input
                      type="text"
                      placeholder="Enter custom category name..."
                      value={customEditHabitCategory}
                      onChange={(e) => setCustomEditHabitCategory(e.target.value)}
                      className="w-full mt-2 px-3.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-indigo-300 dark:border-indigo-800 rounded-lg focus:outline-none text-slate-900 dark:text-slate-100 font-medium animate-fade-in"
                      required
                    />
                  )}
                </div>

                {/* Repeat select trigger */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Repeat Cycle
                  </label>
                  <button
                    type="button"
                    onClick={() => setRepeatModalConfig({
                      type: 'habit',
                      currentValue: editHabitRepeat,
                      currentDays: editHabitRepeatCustomDays,
                      onSave: (mode, days) => {
                        setEditHabitRepeat(mode);
                        setEditHabitRepeatCustomDays(days);
                      }
                    })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none hover:border-indigo-500 text-left text-slate-850 dark:text-slate-200 font-bold flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <Repeat className="h-4 w-4 text-emerald-500" />
                      {editHabitRepeat === 'Custom' ? `Custom (${editHabitRepeatCustomDays.length} days)` : editHabitRepeat}
                    </span>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Optional Alarm settings */}
              <div className="bg-slate-50/50 dark:bg-slate-800/20 p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={editHabitAlarm}
                      onChange={(e) => setEditHabitAlarm(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer h-4 w-4"
                    />
                    <span className="flex items-center gap-1">
                      <Bell className={`h-4 w-4 ${editHabitAlarm ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                      Enable Alarm Reminder?
                    </span>
                  </label>
                </div>

                {editHabitAlarm && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/50 animate-fade-in">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Alarm Time
                      </label>
                      <input
                        type="time"
                        value={editHabitTime}
                        onChange={(e) => setEditHabitTime(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none font-mono text-slate-800 dark:text-slate-150"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Alarm Feedback Mode
                      </label>
                      <select
                        value={editHabitAlarmType}
                        onChange={(e) => setEditHabitAlarmType(e.target.value as any)}
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none font-semibold text-slate-850 dark:text-slate-200"
                      >
                        <option value="Vibration Only">Vibration Only</option>
                        <option value="Ringtone Only">Ringtone Only</option>
                        <option value="Vibration & Ringtone">Vibration & Ringtone</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingHabitId(null)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Save className="h-4 w-4" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reusable Confirmation Modal overlay */}
      {confirmState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-scale-up text-left">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-slate-50 tracking-tight">
                  {confirmState.title}
                </h3>
                <p className="text-xs text-slate-500">Action confirmation required</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <p className="text-slate-600 dark:text-slate-350 text-sm leading-relaxed">
                {confirmState.message}
              </p>
              {confirmState.consequence && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 rounded-2xl text-rose-700 dark:text-rose-400 text-xs font-semibold leading-normal flex items-start gap-1.5">
                  <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <span><strong>Consequence:</strong> {confirmState.consequence}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setConfirmState(null)}
                className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm rounded-2xl transition-all cursor-pointer border border-slate-200/50 dark:border-slate-700 text-center"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmState.onConfirm();
                  setConfirmState(null);
                }}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-2xl transition-all cursor-pointer shadow-lg shadow-indigo-600/20 text-center"
              >
                Confirm & OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Repeat Modal Popup overlay */}
      {repeatModalConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-scale-up text-left">
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl">
                <Repeat className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-slate-50 tracking-tight">
                  Configure Repeat Cycle
                </h3>
                <p className="text-xs text-slate-500">Choose how frequently this action resets</p>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { label: 'Once', value: 'Once', desc: 'No repetitions, single cycle' },
                { label: 'Every day', value: 'Every day', desc: 'Resets daily at midnight' },
                { label: 'Monday to Friday', value: 'Monday to Friday', desc: 'Runs only on weekdays' },
                { label: 'Custom', value: 'Custom', desc: 'Select individual days of the week' }
              ].map((opt) => {
                const isSelected = repeatModalConfig.currentValue === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setRepeatModalConfig({
                        ...repeatModalConfig,
                        currentValue: opt.value as any
                      });
                    }}
                    className={`w-full p-3 rounded-2xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-500 text-indigo-900 dark:text-indigo-50' 
                        : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold">{opt.label}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{opt.desc}</p>
                    </div>
                    {isSelected && (
                      <div className="h-4 w-4 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shrink-0 mt-1">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {repeatModalConfig.currentValue === 'Custom' && (
              <div className="p-3 bg-slate-50 dark:bg-slate-850/50 rounded-2xl border border-slate-150 dark:border-slate-800 space-y-2 animate-fade-in">
                <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Select repetition days</p>
                <div className="flex flex-wrap gap-1.5 justify-between">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                    const isChecked = repeatModalConfig.currentDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          const updated = repeatModalConfig.currentDays.includes(day)
                            ? repeatModalConfig.currentDays.filter(d => d !== day)
                            : [...repeatModalConfig.currentDays, day];
                          setRepeatModalConfig({
                            ...repeatModalConfig,
                            currentDays: updated
                          });
                        }}
                        className={`px-2 py-1 text-[11px] font-semibold rounded-lg border transition-all cursor-pointer ${
                          isChecked 
                            ? 'bg-emerald-500 border-emerald-500 text-white font-bold' 
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {day.substring(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRepeatModalConfig(null)}
                className="w-full py-2.5 px-4 bg-slate-150 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl transition-all cursor-pointer border border-slate-200/50 dark:border-slate-700 text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  repeatModalConfig.onSave(repeatModalConfig.currentValue, repeatModalConfig.currentDays);
                  setRepeatModalConfig(null);
                }}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-md text-center"
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Custom Alarm Settings Modal */}
      <AnimatePresence>
        {alarmModalConfig && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setAlarmModalConfig(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                <h3 className="font-display font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-indigo-500" />
                  {lang === 'ml' ? 'അലാറം ക്രമീകരണങ്ങൾ' : 'Detailed Alarm Settings'}
                </h3>
                <button
                  onClick={() => setAlarmModalConfig(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <label className="flex items-center gap-3 cursor-pointer p-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={alarmModalConfig.enabled}
                    onChange={(e) => setAlarmModalConfig({ ...alarmModalConfig, enabled: e.target.checked })}
                    className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {lang === 'ml' ? 'അലാറം സജീവമാക്കുക' : 'Enable Alarm'}
                    </span>
                    <span className="block text-xs text-slate-500 mt-0.5">
                      {lang === 'ml' ? 'കൃത്യസമയത്ത് നിങ്ങളെ അറിയിക്കും' : 'Get notified at the specified time'}
                    </span>
                  </div>
                </label>

                {alarmModalConfig.enabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4 pt-2"
                  >
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        {lang === 'ml' ? 'അലാറം സമയം' : 'Alarm Time'}
                      </label>
                      <input
                        type="time"
                        value={alarmModalConfig.time}
                        onChange={(e) => setAlarmModalConfig({ ...alarmModalConfig, time: e.target.value })}
                        className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 font-mono font-bold text-slate-800 dark:text-slate-100"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        {lang === 'ml' ? 'അലാറം രീതി' : 'Alarm Feedback Mode'}
                      </label>
                      <div className="space-y-2">
                        {(['Vibration Only', 'Ringtone Only', 'Vibration & Ringtone'] as const).map(type => (
                          <label key={type} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${alarmModalConfig.type === type ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                            <input
                              type="radio"
                              name="alarmType"
                              value={type}
                              checked={alarmModalConfig.type === type}
                              onChange={(e) => setAlarmModalConfig({ ...alarmModalConfig, type: e.target.value as any })}
                              className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                            />
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                {type === 'Vibration Only' ? (lang === 'ml' ? 'വൈബ്രേഷൻ മാത്രം' : 'Vibration Only') :
                                 type === 'Ringtone Only' ? (lang === 'ml' ? 'റിംഗ്‌ടോൺ മാത്രം' : 'Ringtone Only') :
                                 (lang === 'ml' ? 'വൈബ്രേഷനും റിംഗ്‌ടോണും' : 'Vibration & Ringtone')}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {type === 'Vibration Only' ? 'Silent haptic feedback' :
                                 type === 'Ringtone Only' ? 'Audible sound alert' :
                                 'Best of both worlds'}
                              </span>
                            </div>
                            {type === 'Vibration Only' ? <Smartphone className="h-4 w-4 ml-auto text-slate-400" /> :
                             type === 'Ringtone Only' ? <Volume2 className="h-4 w-4 ml-auto text-slate-400" /> :
                             <Bell className="h-4 w-4 ml-auto text-slate-400" />}
                          </label>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  onClick={() => setAlarmModalConfig(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  {lang === 'ml' ? 'റദ്ദാക്കുക' : 'Cancel'}
                </button>
                <button
                  onClick={() => {
                    alarmModalConfig.onSave(alarmModalConfig.enabled, alarmModalConfig.time, alarmModalConfig.type);
                    setAlarmModalConfig(null);
                  }}
                  className="px-6 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
                >
                  {lang === 'ml' ? 'സേവ് ചെയ്യുക' : 'Save Alarm'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full Task Edit Modal */}
      <AnimatePresence>
        {editingTaskData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={handleCancelEditTask}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800"
            >
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur z-10">
                <h3 className="font-display font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                  <Edit2 className="h-5 w-5 text-indigo-500" />
                  {lang === 'ml' ? 'ടാസ്ക് തിരുത്തുക' : 'Edit Task Details'}
                </h3>
                <button
                  onClick={handleCancelEditTask}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    {lang === 'ml' ? 'ടാസ്ക് പേര്' : 'Task Title'}
                  </label>
                  <input
                    type="text"
                    value={editingTaskData.title}
                    onChange={(e) => setEditingTaskData({ ...editingTaskData, title: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    {lang === 'ml' ? 'വിവരണം' : 'Description'}
                  </label>
                  <textarea
                    value={editingTaskData.description || ''}
                    onChange={(e) => setEditingTaskData({ ...editingTaskData, description: e.target.value })}
                    rows={2}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      {lang === 'ml' ? 'തീയതി' : 'Date'}
                    </label>
                    <input
                      type="date"
                      value={editingTaskData.dueDate}
                      onChange={(e) => setEditingTaskData({ ...editingTaskData, dueDate: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-800 dark:text-slate-150"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      {lang === 'ml' ? 'അലാറം ക്രമീകരണങ്ങൾ' : 'Alarm Settings'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setAlarmModalConfig({
                        enabled: editingTaskData.alarmEnabled || false,
                        time: editingTaskData.dueTime || '',
                        type: editingTaskData.alarmType || 'Vibration & Ringtone',
                        onSave: (enabled, time, type) => {
                          setEditingTaskData({ ...editingTaskData, alarmEnabled: enabled, dueTime: time, alarmType: type });
                        }
                      })}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none hover:border-indigo-500 text-left text-slate-800 dark:text-slate-200 font-bold flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <Bell className={`h-4 w-4 ${editingTaskData.alarmEnabled ? 'text-indigo-600' : 'text-slate-400'}`} />
                        {editingTaskData.alarmEnabled && editingTaskData.dueTime ? `${editingTaskData.dueTime} (${editingTaskData.alarmType === 'Vibration & Ringtone' ? 'Both' : editingTaskData.alarmType})` : (lang === 'ml' ? 'അലാറം ചേർക്കുക' : 'Configure Alarm')}
                      </span>
                      <Settings className="h-4 w-4 text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 sticky bottom-0">
                <button
                  onClick={handleCancelEditTask}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  {lang === 'ml' ? 'റദ്ദാക്കുക' : 'Cancel'}
                </button>
                <button
                  onClick={handleSaveEditTaskData}
                  className="px-6 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
                >
                  {lang === 'ml' ? 'സേവ് ചെയ്യുക' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
