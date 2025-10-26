/**
 * Internationalization Translations
 * Supports: English, Chinese, Hindi, Spanish, Arabic
 */

export type Language = 'en' | 'zh' | 'hi' | 'es' | 'ar';

export interface Translations {
  common: {
    welcome: string;
    getStarted: string;
    signIn: string;
    signOut: string;
    signUp: string;
    help: string;
    profile: string;
    dashboard: string;
    settings: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    loading: string;
    error: string;
    success: string;
    back: string;
    next: string;
    finish: string;
  };
  auth: {
    emailLabel: string;
    passwordLabel: string;
    forgotPassword: string;
    createAccount: string;
    alreadyHaveAccount: string;
    resetPassword: string;
    updatePassword: string;
  };
  dashboard: {
    welcomeBack: string;
    totalSessions: string;
    learningTime: string;
    consistency: string;
    subjects: string;
    recentSessions: string;
    startLearning: string;
    viewAll: string;
  };
  session: {
    newSession: string;
    endSession: string;
    selectSubject: string;
    selectTopic: string;
    askQuestion: string;
    thinking: string;
    exportChat: string;
    whiteboard: string;
    voiceInput: string;
    voiceOutput: string;
  };
  subjects: {
    mathematics: string;
    physics: string;
    chemistry: string;
    biology: string;
    computerScience: string;
    english: string;
    history: string;
    geography: string;
  };
  analytics: {
    progress: string;
    insights: string;
    performance: string;
    strengths: string;
    improvements: string;
    recommendations: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    common: {
      welcome: 'Welcome to AI-Shu',
      getStarted: 'Get Started',
      signIn: 'Sign In',
      signOut: 'Sign Out',
      signUp: 'Sign Up',
      help: 'Help',
      profile: 'Profile',
      dashboard: 'Dashboard',
      settings: 'Settings',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      back: 'Back',
      next: 'Next',
      finish: 'Finish',
    },
    auth: {
      emailLabel: 'Email',
      passwordLabel: 'Password',
      forgotPassword: 'Forgot Password?',
      createAccount: 'Create Account',
      alreadyHaveAccount: 'Already have an account?',
      resetPassword: 'Reset Password',
      updatePassword: 'Update Password',
    },
    dashboard: {
      welcomeBack: 'Welcome back',
      totalSessions: 'Total Sessions',
      learningTime: 'Learning Time',
      consistency: 'Consistency',
      subjects: 'Subjects',
      recentSessions: 'Recent Sessions',
      startLearning: 'Start Learning',
      viewAll: 'View All',
    },
    session: {
      newSession: 'New Session',
      endSession: 'End Session',
      selectSubject: 'Select Subject',
      selectTopic: 'Select Topic',
      askQuestion: 'Ask a question or share your thoughts...',
      thinking: 'Thinking...',
      exportChat: 'Export Chat',
      whiteboard: 'Whiteboard',
      voiceInput: 'Voice Input',
      voiceOutput: 'Read Aloud',
    },
    subjects: {
      mathematics: 'Mathematics',
      physics: 'Physics',
      chemistry: 'Chemistry',
      biology: 'Biology',
      computerScience: 'Computer Science',
      english: 'English',
      history: 'History',
      geography: 'Geography',
    },
    analytics: {
      progress: 'Progress',
      insights: 'Insights',
      performance: 'Performance',
      strengths: 'Strengths',
      improvements: 'Areas for Improvement',
      recommendations: 'Recommendations',
    },
  },
  zh: {
    common: {
      welcome: '欢迎来到AI-Shu',
      getStarted: '开始使用',
      signIn: '登录',
      signOut: '登出',
      signUp: '注册',
      help: '帮助',
      profile: '个人资料',
      dashboard: '仪表板',
      settings: '设置',
      save: '保存',
      cancel: '取消',
      delete: '删除',
      edit: '编辑',
      loading: '加载中...',
      error: '错误',
      success: '成功',
      back: '返回',
      next: '下一步',
      finish: '完成',
    },
    auth: {
      emailLabel: '电子邮件',
      passwordLabel: '密码',
      forgotPassword: '忘记密码？',
      createAccount: '创建账户',
      alreadyHaveAccount: '已有账户？',
      resetPassword: '重置密码',
      updatePassword: '更新密码',
    },
    dashboard: {
      welcomeBack: '欢迎回来',
      totalSessions: '总课程数',
      learningTime: '学习时间',
      consistency: '连续性',
      subjects: '科目',
      recentSessions: '最近课程',
      startLearning: '开始学习',
      viewAll: '查看全部',
    },
    session: {
      newSession: '新课程',
      endSession: '结束课程',
      selectSubject: '选择科目',
      selectTopic: '选择主题',
      askQuestion: '提问或分享您的想法...',
      thinking: '思考中...',
      exportChat: '导出聊天',
      whiteboard: '白板',
      voiceInput: '语音输入',
      voiceOutput: '朗读',
    },
    subjects: {
      mathematics: '数学',
      physics: '物理',
      chemistry: '化学',
      biology: '生物',
      computerScience: '计算机科学',
      english: '英语',
      history: '历史',
      geography: '地理',
    },
    analytics: {
      progress: '进度',
      insights: '见解',
      performance: '表现',
      strengths: '优势',
      improvements: '需要改进的领域',
      recommendations: '建议',
    },
  },
  hi: {
    common: {
      welcome: 'AI-Shu में आपका स्वागत है',
      getStarted: 'शुरू करें',
      signIn: 'साइन इन करें',
      signOut: 'साइन आउट करें',
      signUp: 'साइन अप करें',
      help: 'सहायता',
      profile: 'प्रोफ़ाइल',
      dashboard: 'डैशबोर्ड',
      settings: 'सेटिंग्स',
      save: 'सहेजें',
      cancel: 'रद्द करें',
      delete: 'हटाएं',
      edit: 'संपादित करें',
      loading: 'लोड हो रहा है...',
      error: 'त्रुटि',
      success: 'सफलता',
      back: 'वापस',
      next: 'अगला',
      finish: 'समाप्त',
    },
    auth: {
      emailLabel: 'ईमेल',
      passwordLabel: 'पासवर्ड',
      forgotPassword: 'पासवर्ड भूल गए?',
      createAccount: 'खाता बनाएं',
      alreadyHaveAccount: 'पहले से खाता है?',
      resetPassword: 'पासवर्ड रीसेट करें',
      updatePassword: 'पासवर्ड अपडेट करें',
    },
    dashboard: {
      welcomeBack: 'वापस स्वागत है',
      totalSessions: 'कुल सत्र',
      learningTime: 'सीखने का समय',
      consistency: 'निरंतरता',
      subjects: 'विषय',
      recentSessions: 'हाल के सत्र',
      startLearning: 'सीखना शुरू करें',
      viewAll: 'सभी देखें',
    },
    session: {
      newSession: 'नया सत्र',
      endSession: 'सत्र समाप्त करें',
      selectSubject: 'विषय चुनें',
      selectTopic: 'विषय चुनें',
      askQuestion: 'प्रश्न पूछें या अपने विचार साझा करें...',
      thinking: 'सोच रहा है...',
      exportChat: 'चैट निर्यात करें',
      whiteboard: 'व्हाइटबोर्ड',
      voiceInput: 'आवाज़ इनपुट',
      voiceOutput: 'जोर से पढ़ें',
    },
    subjects: {
      mathematics: 'गणित',
      physics: 'भौतिकी',
      chemistry: 'रसायन विज्ञान',
      biology: 'जीव विज्ञान',
      computerScience: 'कंप्यूटर विज्ञान',
      english: 'अंग्रेज़ी',
      history: 'इतिहास',
      geography: 'भूगोल',
    },
    analytics: {
      progress: 'प्रगति',
      insights: 'अंतर्दृष्टि',
      performance: 'प्रदर्शन',
      strengths: 'शक्तियां',
      improvements: 'सुधार के क्षेत्र',
      recommendations: 'सुझाव',
    },
  },
  es: {
    common: {
      welcome: 'Bienvenido a AI-Shu',
      getStarted: 'Comenzar',
      signIn: 'Iniciar Sesión',
      signOut: 'Cerrar Sesión',
      signUp: 'Registrarse',
      help: 'Ayuda',
      profile: 'Perfil',
      dashboard: 'Panel',
      settings: 'Configuración',
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      back: 'Atrás',
      next: 'Siguiente',
      finish: 'Finalizar',
    },
    auth: {
      emailLabel: 'Correo Electrónico',
      passwordLabel: 'Contraseña',
      forgotPassword: '¿Olvidaste tu Contraseña?',
      createAccount: 'Crear Cuenta',
      alreadyHaveAccount: '¿Ya tienes una cuenta?',
      resetPassword: 'Restablecer Contraseña',
      updatePassword: 'Actualizar Contraseña',
    },
    dashboard: {
      welcomeBack: 'Bienvenido de nuevo',
      totalSessions: 'Sesiones Totales',
      learningTime: 'Tiempo de Aprendizaje',
      consistency: 'Consistencia',
      subjects: 'Materias',
      recentSessions: 'Sesiones Recientes',
      startLearning: 'Comenzar a Aprender',
      viewAll: 'Ver Todo',
    },
    session: {
      newSession: 'Nueva Sesión',
      endSession: 'Finalizar Sesión',
      selectSubject: 'Seleccionar Materia',
      selectTopic: 'Seleccionar Tema',
      askQuestion: 'Haz una pregunta o comparte tus pensamientos...',
      thinking: 'Pensando...',
      exportChat: 'Exportar Chat',
      whiteboard: 'Pizarra',
      voiceInput: 'Entrada de Voz',
      voiceOutput: 'Leer en Voz Alta',
    },
    subjects: {
      mathematics: 'Matemáticas',
      physics: 'Física',
      chemistry: 'Química',
      biology: 'Biología',
      computerScience: 'Informática',
      english: 'Inglés',
      history: 'Historia',
      geography: 'Geografía',
    },
    analytics: {
      progress: 'Progreso',
      insights: 'Perspectivas',
      performance: 'Rendimiento',
      strengths: 'Fortalezas',
      improvements: 'Áreas de Mejora',
      recommendations: 'Recomendaciones',
    },
  },
  ar: {
    common: {
      welcome: 'مرحباً بك في AI-Shu',
      getStarted: 'ابدأ',
      signIn: 'تسجيل الدخول',
      signOut: 'تسجيل الخروج',
      signUp: 'التسجيل',
      help: 'مساعدة',
      profile: 'الملف الشخصي',
      dashboard: 'لوحة التحكم',
      settings: 'الإعدادات',
      save: 'حفظ',
      cancel: 'إلغاء',
      delete: 'حذف',
      edit: 'تعديل',
      loading: 'جاري التحميل...',
      error: 'خطأ',
      success: 'نجاح',
      back: 'رجوع',
      next: 'التالي',
      finish: 'إنهاء',
    },
    auth: {
      emailLabel: 'البريد الإلكتروني',
      passwordLabel: 'كلمة المرور',
      forgotPassword: 'نسيت كلمة المرور؟',
      createAccount: 'إنشاء حساب',
      alreadyHaveAccount: 'هل لديك حساب بالفعل؟',
      resetPassword: 'إعادة تعيين كلمة المرور',
      updatePassword: 'تحديث كلمة المرور',
    },
    dashboard: {
      welcomeBack: 'مرحباً بعودتك',
      totalSessions: 'إجمالي الجلسات',
      learningTime: 'وقت التعلم',
      consistency: 'الاستمرارية',
      subjects: 'المواد',
      recentSessions: 'الجلسات الأخيرة',
      startLearning: 'ابدأ التعلم',
      viewAll: 'عرض الكل',
    },
    session: {
      newSession: 'جلسة جديدة',
      endSession: 'إنهاء الجلسة',
      selectSubject: 'اختر المادة',
      selectTopic: 'اختر الموضوع',
      askQuestion: 'اطرح سؤالاً أو شارك أفكارك...',
      thinking: 'جاري التفكير...',
      exportChat: 'تصدير المحادثة',
      whiteboard: 'السبورة',
      voiceInput: 'إدخال صوتي',
      voiceOutput: 'قراءة بصوت عالٍ',
    },
    subjects: {
      mathematics: 'الرياضيات',
      physics: 'الفيزياء',
      chemistry: 'الكيمياء',
      biology: 'الأحياء',
      computerScience: 'علوم الحاسوب',
      english: 'الإنجليزية',
      history: 'التاريخ',
      geography: 'الجغرافيا',
    },
    analytics: {
      progress: 'التقدم',
      insights: 'رؤى',
      performance: 'الأداء',
      strengths: 'نقاط القوة',
      improvements: 'مجالات التحسين',
      recommendations: 'التوصيات',
    },
  },
};
