import { useState, useEffect } from 'react';
import { ClipboardCheck, ChevronRight } from 'lucide-react';
import { QuestionnaireResponse, User } from '../types';
import { storage } from '../utils/storage';

interface QuestionnairesProps {
  user: User;
}

const PHQ9_QUESTIONS = [
  'Little interest or pleasure in doing things',
  'Feeling down, depressed, or hopeless',
  'Trouble falling or staying asleep, or sleeping too much',
  'Feeling tired or having little energy',
  'Poor appetite or overeating',
  'Feeling bad about yourself or that you are a failure',
  'Trouble concentrating on things',
  'Moving or speaking slowly, or being fidgety or restless',
  'Thoughts that you would be better off dead',
];

const PHQ9_OPTIONS = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Several days' },
  { value: 2, label: 'More than half the days' },
  { value: 3, label: 'Nearly every day' },
];

export default function Questionnaires({ user }: QuestionnairesProps) {
  const [responses, setResponses] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [history, setHistory] = useState<QuestionnaireResponse[]>([]);
  const [activeView, setActiveView] = useState<'list' | 'form' | 'results'>('list');

  useEffect(() => {
    loadHistory();
  }, [user.id]);

  const loadHistory = () => {
    const questionnaires = storage.getQuestionnaires(user.id);
    setHistory(questionnaires);
  };

  const handleResponseChange = (questionIndex: number, value: number) => {
    setResponses((prev) => ({ ...prev, [questionIndex]: value }));
  };

  const calculateScore = () => {
    return Object.values(responses).reduce((sum, val) => sum + val, 0);
  };

  const getScoreInterpretation = (score: number) => {
    if (score <= 4) return { level: 'Minimal', color: 'green', message: 'Minimal or no depression detected.' };
    if (score <= 9) return { level: 'Mild', color: 'yellow', message: 'Mild depression. Consider monitoring your mood.' };
    if (score <= 14) return { level: 'Moderate', color: 'orange', message: 'Moderate depression. Consider talking to someone you trust.' };
    if (score <= 19) return { level: 'Moderately Severe', color: 'red', message: 'Moderately severe depression. Professional support is recommended.' };
    return { level: 'Severe', color: 'red', message: 'Severe depression. Please seek professional help.' };
  };

  const handleSubmit = () => {
    if (Object.keys(responses).length !== PHQ9_QUESTIONS.length) {
      alert('Please answer all questions');
      return;
    }

    const score = calculateScore();
    const questionnaire: QuestionnaireResponse = {
      id: crypto.randomUUID(),
      userId: user.id,
      questionnaireType: 'PHQ-9',
      responses,
      score,
      createdAt: new Date().toISOString(),
    };

    storage.addQuestionnaire(questionnaire);
    setShowResults(true);
    setActiveView('results');
    loadHistory();
  };

  const startNewQuestionnaire = () => {
    setResponses({});
    setShowResults(false);
    setActiveView('form');
  };

  if (activeView === 'form') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-pink-50 pb-24 px-4 pt-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setActiveView('list')}
            className="mb-6 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Back
          </button>

          <div className="bg-white rounded-3xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <ClipboardCheck className="w-8 h-8 text-green-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">PHQ-9 Assessment</h2>
                <p className="text-sm text-gray-600">Patient Health Questionnaire</p>
              </div>
            </div>

            <p className="text-gray-700 mb-8 leading-relaxed">
              Over the last 2 weeks, how often have you been bothered by any of the following
              problems?
            </p>

            <div className="space-y-8">
              {PHQ9_QUESTIONS.map((question, index) => (
                <div key={index} className="space-y-3">
                  <p className="font-medium text-gray-800">
                    {index + 1}. {question}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {PHQ9_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleResponseChange(index, option.value)}
                        className={`px-4 py-3 rounded-xl border-2 transition-all text-sm ${
                          responses[index] === option.value
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={Object.keys(responses).length !== PHQ9_QUESTIONS.length}
              className="w-full mt-8 bg-gradient-to-r from-green-400 to-green-500 text-white py-4 rounded-xl font-medium hover:from-green-500 hover:to-green-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (activeView === 'results') {
    const score = calculateScore();
    const interpretation = getScoreInterpretation(score);

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-pink-50 pb-24 px-4 pt-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setActiveView('list')}
            className="mb-6 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Back to Assessments
          </button>

          <div className="bg-white rounded-3xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-24 h-24 bg-${interpretation.color}-100 rounded-full mb-4`}>
                <span className="text-4xl font-bold text-gray-800">{score}</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{interpretation.level}</h2>
              <p className="text-gray-600">{interpretation.message}</p>
            </div>

            <div className="bg-blue-50 rounded-2xl p-6 mb-6">
              <p className="text-sm text-gray-700 leading-relaxed">
                This assessment is a screening tool and not a diagnostic instrument. If you're
                concerned about your mental health, please reach out to a mental health
                professional for a comprehensive evaluation.
              </p>
            </div>

            <button
              onClick={startNewQuestionnaire}
              className="w-full bg-gradient-to-r from-green-400 to-green-500 text-white py-3 rounded-xl font-medium hover:from-green-500 hover:to-green-600 transition-all shadow-md"
            >
              Take Another Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-pink-50 pb-24 px-4 pt-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Mental Wellness</h1>
        <p className="text-gray-600 mb-8">Track your mental health over time</p>

        <div className="space-y-4">
          <div className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer" onClick={startNewQuestionnaire}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
                  <ClipboardCheck className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">PHQ-9 Assessment</h3>
                  <p className="text-sm text-gray-600">Depression screening questionnaire</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-gray-400" />
            </div>
          </div>

          {history.length > 0 && (
            <div className="bg-white rounded-3xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Assessment History</h3>
              <div className="space-y-3">
                {history.slice(0, 5).map((item) => {
                  const interpretation = getScoreInterpretation(item.score || 0);
                  return (
                    <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{item.questionnaireType}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-800">{item.score}</div>
                        <div className={`text-xs text-${interpretation.color}-600`}>
                          {interpretation.level}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
