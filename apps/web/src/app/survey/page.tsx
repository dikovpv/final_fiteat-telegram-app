'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Scale, 
  Ruler, 
  Target, 
  Activity, 
  Heart, 
  Save,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

declare global { interface Window { Telegram?: any } }

interface FormData {
  gender: 'male' | 'female';
  age: number | '';
  heightCm: number | '';
  weightKg: number | '';
  goal: 'lose' | 'maintain' | 'gain';
  activity: 'low' | 'medium' | 'high';
  preferences: string;
  name?: string;
  username?: string;
}

export default function Survey() {
  const [form, setForm] = useState<FormData>({ 
    gender: 'male', 
    goal: 'lose', 
    activity: 'medium',
    age: '',
    heightCm: '',
    weightKg: '',
    preferences: ''
  });
  
  const [telegramId, setTelegramId] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tg = window?.Telegram?.WebApp;
      tg?.ready?.();
      const user = tg?.initDataUnsafe?.user;
      if (user) {
        setTelegramId(String(user.id));
        setForm(prev => ({
          ...prev, 
          name: user.first_name, 
          username: user.username 
        }));
      }
    }
  }, []);

  const calculateBMI = () => {
    if (form.heightCm && form.weightKg) {
      const heightInM = Number(form.heightCm) / 100;
      const bmi = Number(form.weightKg) / (heightInM * heightInM);
      return bmi.toFixed(1);
    }
    return null;
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Недовес', color: 'text-blue-400' };
    if (bmi < 25) return { category: 'Норма', color: 'text-green-400' };
    if (bmi < 30) return { category: 'Избыточный вес', color: 'text-yellow-400' };
    return { category: 'Ожирение', color: 'text-red-400' };
  };

  const submit = async () => {
    setIsSubmitting(true);
    setStatus('Сохранение...');
    
    try {
      const res = await fetch('/api/survey', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ ...form, telegramId })
      });
      
      const data = await res.json();
      
      if (data.ok) {
        setStatus('Данные успешно сохранены! ✅');
        // Сохраняем в localStorage для использования в приложении
        if (typeof window !== 'undefined') {
          localStorage.setItem('userSurveyData', JSON.stringify({ ...form, telegramId }));
        }
      } else {
        setStatus('Ошибка: ' + data.error);
      }
    } catch (error) {
      setStatus('Произошла ошибка при сохранении');
    } finally {
      setIsSubmitting(false);
    }
  };

  const bmi = calculateBMI();
  const bmiInfo = bmi ? getBMICategory(Number(bmi)) : null;

  const inputVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Cosmic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-cyan-400 rounded-full animate-pulse delay-300"></div>
        <div className="absolute bottom-40 left-1/4 w-3 h-3 bg-pink-400 rounded-full animate-pulse delay-700"></div>
        <div className="absolute bottom-20 right-10 w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 p-4 pb-20">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Расскажите о себе</h1>
          <p className="text-gray-300">Помогите нам создать персональный план для вас</p>
          
          {!telegramId && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-300 text-sm">Откройте мини-эп из Telegram, чтобы подтянулся ваш ID</p>
            </motion.div>
          )}
        </motion.div>

        {/* BMI Calculator Preview */}
        {bmiInfo && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6 p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold">Индекс массы тела (BMI)</h3>
                <p className="text-gray-300 text-sm">Ваш текущий показатель</p>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${bmiInfo.color}`}>{bmi}</div>
                <div className="text-gray-300 text-sm">{bmiInfo.category}</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-md mx-auto space-y-4"
        >
          {/* Gender */}
          <motion.div variants={inputVariants} initial="initial" animate="animate">
            <label className="block text-white font-medium mb-2">Пол</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <select 
                className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={form.gender} 
                onChange={e => setForm({...form, gender: e.target.value as 'male' | 'female'})}
              >
                <option value="male" className="bg-gray-800">Мужской</option>
                <option value="female" className="bg-gray-800">Женский</option>
              </select>
            </div>
          </motion.div>

          {/* Age */}
          <motion.div variants={inputVariants} initial="initial" animate="animate">
            <label className="block text-white font-medium mb-2">Возраст</label>
            <div className="relative">
              <Heart className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input 
                className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                type="number" 
                placeholder="25"
                value={form.age || ''} 
                onChange={e => setForm({...form, age: e.target.value ? Number(e.target.value) : ''})}
                min="16"
                max="100"
              />
            </div>
          </motion.div>

          {/* Height */}
          <motion.div variants={inputVariants} initial="initial" animate="animate">
            <label className="block text-white font-medium mb-2">Рост (см)</label>
            <div className="relative">
              <Ruler className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input 
                className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                type="number" 
                placeholder="175"
                value={form.heightCm || ''} 
                onChange={e => setForm({...form, heightCm: e.target.value ? Number(e.target.value) : ''})}
                min="140"
                max="220"
              />
            </div>
          </motion.div>

          {/* Weight */}
          <motion.div variants={inputVariants} initial="initial" animate="animate">
            <label className="block text-white font-medium mb-2">Вес (кг)</label>
            <div className="relative">
              <Scale className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input 
                className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                type="number" 
                placeholder="70"
                value={form.weightKg || ''} 
                onChange={e => setForm({...form, weightKg: e.target.value ? Number(e.target.value) : ''})}
                min="40"
                max="200"
              />
            </div>
          </motion.div>

          {/* Goal */}
          <motion.div variants={inputVariants} initial="initial" animate="animate">
            <label className="block text-white font-medium mb-2">Цель</label>
            <div className="relative">
              <Target className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <select 
                className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={form.goal} 
                onChange={e => setForm({...form, goal: e.target.value as 'lose' | 'maintain' | 'gain'})}
              >
                <option value="lose" className="bg-gray-800">Похудение</option>
                <option value="maintain" className="bg-gray-800">Поддержание</option>
                <option value="gain" className="bg-gray-800">Набор массы</option>
              </select>
            </div>
          </motion.div>

          {/* Activity */}
          <motion.div variants={inputVariants} initial="initial" animate="animate">
            <label className="block text-white font-medium mb-2">Уровень активности</label>
            <div className="relative">
              <Activity className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <select 
                className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={form.activity} 
                onChange={e => setForm({...form, activity: e.target.value as 'low' | 'medium' | 'high'})}
              >
                <option value="low" className="bg-gray-800">Низкая (сидячая работа)</option>
                <option value="medium" className="bg-gray-800">Средняя (легкие тренировки)</option>
                <option value="high" className="bg-gray-800">Высокая (интенсивные тренировки)</option>
              </select>
            </div>
          </motion.div>

          {/* Preferences */}
          <motion.div variants={inputVariants} initial="initial" animate="animate">
            <label className="block text-white font-medium mb-2">Предпочтения/аллергии</label>
            <textarea 
              className="w-full p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={3}
              placeholder="Опишите ваши пищевые предпочтения или аллергии..."
              value={form.preferences} 
              onChange={e => setForm({...form, preferences: e.target.value})}
            />
          </motion.div>

          {/* Submit Button */}
          <motion.div variants={inputVariants} initial="initial" animate="animate">
            <button 
              onClick={submit}
              disabled={isSubmitting || !telegramId}
              className="w-full py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Сохранить данные
                </>
              )}
            </button>
          </motion.div>

          {/* Status */}
          {status && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-xl text-center ${
                status.includes('успешно') || status.includes('✅') 
                  ? 'bg-green-500/20 border border-green-500/30 text-green-300' 
                  : status.includes('Ошибка') 
                    ? 'bg-red-500/20 border border-red-500/30 text-red-300'
                    : 'bg-blue-500/20 border border-blue-500/30 text-blue-300'
              }`}
            >
              {status.includes('успешно') && <CheckCircle className="w-4 h-4 inline mr-1" />}
              {status}
            </motion.div>
          )}
        </motion.div>

        {/* Tips */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-6 bg-gradient-to-br from-blue-600/30 to-purple-600/30 backdrop-blur-md border border-blue-500/30 rounded-xl"
        >
          <h3 className="text-xl font-semibold text-white mb-3">💡 Почему это важно?</h3>
          <div className="space-y-2 text-sm text-gray-300">
            <p>• Персональные рекомендации основаны на ваших данных</p>
            <p>• Расчет суточной нормы калорий и макронутриентов</p>
            <p>• Подбор оптимальных программ тренировок</p>
            <p>• Учет особенностей организма и образа жизни</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}