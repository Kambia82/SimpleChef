import React, { useState, useEffect, useRef } from "react";
import { Meal, MealStep } from "../types";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Timer as TimerIcon,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Volume2
} from "lucide-react";
import { playChime } from "../utils/sound";

interface CookingFocusModeProps {
  meal: Meal;
  onClose: () => void;
  onAddToGrocery: (meal: Meal) => void;
}

export const CookingFocusMode: React.FC<CookingFocusModeProps> = ({
  meal,
  onClose,
  onAddToGrocery
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const currentStep: MealStep = meal.instructions[currentStepIndex] || meal.instructions[0];
  const timerRef = useRef<number | null>(null);

  // Sync timer when step changes
  useEffect(() => {
    if (currentStep && currentStep.timerSeconds && currentStep.timerSeconds > 0) {
      setTimerSecondsLeft(currentStep.timerSeconds);
      setIsTimerRunning(false);
    } else {
      setTimerSecondsLeft(0);
      setIsTimerRunning(false);
    }
  }, [currentStepIndex, currentStep]);

  // Handle countdown
  useEffect(() => {
    if (isTimerRunning && timerSecondsLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimerSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsTimerRunning(false);
            playChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!isTimerRunning && timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timerSecondsLeft]);

  const toggleTimer = () => {
    if (timerSecondsLeft === 0 && currentStep.timerSeconds) {
      setTimerSecondsLeft(currentStep.timerSeconds);
      setIsTimerRunning(true);
    } else {
      setIsTimerRunning((prev) => !prev);
    }
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    if (currentStep.timerSeconds) {
      setTimerSecondsLeft(currentStep.timerSeconds);
    }
  };

  const markStepDone = (index: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleNext = () => {
    // mark current step done
    setCompletedSteps((prev) => ({ ...prev, [currentStepIndex]: true }));
    if (currentStepIndex < meal.instructions.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
      playChime();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-stone-50 text-stone-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header bar */}
        <div className="bg-emerald-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="bg-emerald-800 text-emerald-100 text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full">
              Cooking Focus Mode
            </span>
            <span className="text-emerald-200 text-sm hidden sm:inline">
              Step {currentStepIndex + 1} of {meal.instructions.length}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onAddToGrocery(meal)}
              className="text-xs bg-emerald-800/80 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
              title="Add ingredients to Walmart list"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Walmart List</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-emerald-800 rounded-lg text-emerald-200 hover:text-white transition-colors"
              aria-label="Close cooking mode"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="w-full bg-stone-200 h-1.5">
          <div
            className="bg-emerald-600 h-1.5 transition-all duration-300"
            style={{
              width: `${((currentStepIndex + (isFinished ? 1 : 0)) / meal.instructions.length) * 100}%`
            }}
          />
        </div>

        {/* Main Step Body */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto">
          {isFinished ? (
            <div className="text-center py-8 space-y-5">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Sparkles className="w-9 h-9" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">
                  You did it! Meal complete.
                </h2>
                <p className="text-stone-600 mt-2 max-w-md mx-auto text-base">
                  No thinking, no stress, no burnt pans. Sit down and enjoy your warm, nutritious food!
                </p>
              </div>

              <div className="bg-white border border-stone-200 rounded-xl p-4 text-left max-w-md mx-auto shadow-sm">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
                  Why this was a win
                </div>
                <p className="text-sm text-stone-700">{meal.whyItWorks}</p>
              </div>

              <div className="pt-3 flex justify-center gap-3">
                <button
                  onClick={onClose}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium px-6 py-3 rounded-xl shadow transition-colors"
                >
                  Return to Meals
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Step indicator and title */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                  <span>Step {currentStep.stepNumber} of {meal.instructions.length}</span>
                  <span>{meal.title}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                  {currentStep.title}
                </h3>
              </div>

              {/* The big step instruction card */}
              <div className="bg-white rounded-xl p-6 sm:p-7 border-2 border-stone-200 shadow-sm space-y-4">
                <p className="text-lg sm:text-xl text-stone-800 leading-relaxed font-normal">
                  {currentStep.instruction}
                </p>

                {/* Built-in timer if this step has cooking time */}
                {currentStep.timerSeconds && currentStep.timerSeconds > 0 ? (
                  <div className="mt-4 pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 bg-emerald-50/60 p-4 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-lg">
                        <TimerIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-emerald-900 uppercase">
                          Step Timer
                        </div>
                        <div className="text-2xl font-bold font-mono text-emerald-950">
                          {formatTime(timerSecondsLeft)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={toggleTimer}
                        className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center space-x-1.5 transition-colors shadow-sm ${
                          isTimerRunning
                            ? "bg-amber-600 hover:bg-amber-700 text-white"
                            : "bg-emerald-700 hover:bg-emerald-800 text-white"
                        }`}
                      >
                        {isTimerRunning ? (
                          <>
                            <Pause className="w-4 h-4" />
                            <span>Pause</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            <span>{timerSecondsLeft === 0 ? "Restart" : "Start Timer"}</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={resetTimer}
                        className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 rounded-lg transition-colors"
                        title="Reset timer"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>

                    {timerSecondsLeft === 0 && !isTimerRunning && (
                      <div className="w-full text-center text-xs font-semibold text-emerald-700 flex items-center justify-center gap-1.5 pt-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Timer finished! Check if food is ready to proceed.</span>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Working memory safety checkbox */}
              <div
                onClick={() => markStepDone(currentStepIndex)}
                className={`cursor-pointer p-3.5 rounded-xl border flex items-center space-x-3 transition-colors ${
                  completedSteps[currentStepIndex]
                    ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                    : "bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-200/70"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                    completedSteps[currentStepIndex]
                      ? "bg-emerald-600 text-white"
                      : "border-2 border-stone-400 bg-white"
                  }`}
                >
                  {completedSteps[currentStepIndex] && <CheckCircle2 className="w-4 h-4" />}
                </div>
                <span className="text-sm font-medium">
                  {completedSteps[currentStepIndex]
                    ? "Done with this step! (Checked off so you don't repeat it)"
                    : "Tap to mark this step finished"}
                </span>
              </div>

              {/* Mini step list overview for mental grounding */}
              <div className="pt-2">
                <div className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                  All Steps in this meal:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {meal.instructions.map((step, idx) => (
                    <button
                      key={step.stepNumber}
                      onClick={() => setCurrentStepIndex(idx)}
                      className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                        idx === currentStepIndex
                          ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-600/20"
                          : completedSteps[idx]
                          ? "border-emerald-200 bg-stone-100 text-stone-500 line-through"
                          : "border-stone-200 bg-white text-stone-700 hover:bg-stone-100"
                      }`}
                    >
                      <div className="text-[10px] text-stone-400 uppercase font-semibold">Step {step.stepNumber}</div>
                      <div className="truncate">{step.title}</div>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        {!isFinished && (
          <div className="bg-stone-100 border-t border-stone-200 px-6 py-4 flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium flex items-center space-x-1.5 transition-colors ${
                currentStepIndex === 0
                  ? "text-stone-400 cursor-not-allowed"
                  : "text-stone-700 hover:bg-stone-200 bg-white border border-stone-300 shadow-sm"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={handleNext}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium px-6 py-2.5 rounded-xl shadow-sm flex items-center space-x-2 transition-colors"
            >
              <span>{currentStepIndex === meal.instructions.length - 1 ? "Finish Meal!" : "Next Step"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
