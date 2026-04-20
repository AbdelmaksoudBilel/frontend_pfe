// src/i18n/translations.js
// =============================================================================
// Dictionnaire i18n complet — fr | en | ar
// Couvre toutes les pages : auth, chat, profile, diagnostic, admin
// =============================================================================

const translations = {

  // ── Navigation ─────────────────────────────────────────────────────────────
  nav: {
    home       : { fr: "Accueil",        en: "Home",         ar: "الرئيسية"      },
    about      : { fr: "À propos",       en: "About",        ar: "حول"           },
    services   : { fr: "Services",       en: "Services",     ar: "الخدمات"       },
    contact    : { fr: "Contact",        en: "Contact",      ar: "اتصل بنا"      },
    start      : { fr: "Commencer",      en: "Get Started",  ar: "ابدأ"          },
    logout     : { fr: "Déconnexion",    en: "Logout",       ar: "تسجيل الخروج"  },
    profile    : { fr: "Mon profil",     en: "My profile",   ar: "ملفي الشخصي"   },
    chat       : { fr: "Assistant",      en: "Assistant",    ar: "المساعد"       },
  },

  // ── Auth ───────────────────────────────────────────────────────────────────
  auth: {
    login             : { fr: "Se connecter",      en: "Log in",           ar: "تسجيل الدخول"    },
    register          : { fr: "Créer un compte",   en: "Create account",   ar: "إنشاء حساب"       },
    email             : { fr: "Adresse email",     en: "Email address",    ar: "البريد الإلكتروني" },
    password          : { fr: "Mot de passe",      en: "Password",         ar: "كلمة المرور"      },
    confirmPassword   : { fr: "Confirmer le mot de passe", en: "Confirm password", ar: "تأكيد كلمة المرور" },
    forgotPassword    : { fr: "Mot de passe oublié ?", en: "Forgot password?", ar: "نسيت كلمة المرور؟" },
    firstName         : { fr: "Prénom",            en: "First name",       ar: "الاسم الأول"      },
    lastName          : { fr: "Nom",               en: "Last name",        ar: "اللقب"            },
    phone             : { fr: "Téléphone",         en: "Phone",            ar: "الهاتف"           },
    language          : { fr: "Langue préférée",   en: "Preferred language", ar: "اللغة المفضلة"  },
    welcomeBack       : { fr: "Bon retour 👋",     en: "Welcome back 👋",  ar: "مرحباً بعودتك 👋" },
    noAccount        : { fr: "Pas encore de compte ?", en: "No account yet?", ar: "ليس لديك حساب؟" },
    alreadyAccount   : { fr: "Déjà un compte ?",  en: "Already have an account?", ar: "هل لديك حساب؟" },
    emailVerified    : { fr: "Email confirmé ✅",  en: "Email confirmed ✅", ar: "تم تأكيد البريد ✅" },
    accountPending   : { fr: "Compte en attente d'approbation", en: "Account pending approval", ar: "الحساب في انتظار الموافقة" },
    sendLink         : { fr: "Envoyer le lien",    en: "Send link",        ar: "إرسال الرابط"     },
    resetPassword    : { fr: "Réinitialiser le mot de passe", en: "Reset password", ar: "إعادة تعيين كلمة المرور" },
  },

  // ── Common actions ─────────────────────────────────────────────────────────
  actions: {
    save       : { fr: "Sauvegarder",    en: "Save",          ar: "حفظ"           },
    cancel     : { fr: "Annuler",        en: "Cancel",        ar: "إلغاء"         },
    confirm    : { fr: "Confirmer",      en: "Confirm",       ar: "تأكيد"         },
    delete     : { fr: "Supprimer",      en: "Delete",        ar: "حذف"           },
    edit       : { fr: "Modifier",       en: "Edit",          ar: "تعديل"         },
    add        : { fr: "Ajouter",        en: "Add",           ar: "إضافة"         },
    close      : { fr: "Fermer",         en: "Close",         ar: "إغلاق"         },
    back       : { fr: "Retour",         en: "Back",          ar: "رجوع"          },
    continue   : { fr: "Continuer",      en: "Continue",      ar: "متابعة"        },
    submit     : { fr: "Soumettre",      en: "Submit",        ar: "إرسال"         },
    search     : { fr: "Rechercher",     en: "Search",        ar: "بحث"           },
    refresh    : { fr: "Rafraîchir",     en: "Refresh",       ar: "تحديث"         },
    viewAll    : { fr: "Voir tout",      en: "View all",      ar: "عرض الكل"      },
    loading    : { fr: "Chargement...",  en: "Loading...",    ar: "جاري التحميل..." },
    noData     : { fr: "Aucune donnée",  en: "No data",       ar: "لا توجد بيانات" },
  },

  // ── Status ─────────────────────────────────────────────────────────────────
  status: {
    approved   : { fr: "Approuvé",       en: "Approved",      ar: "موافق عليه"    },
    pending    : { fr: "En attente",     en: "Pending",       ar: "في الانتظار"   },
    rejected   : { fr: "Rejeté",         en: "Rejected",      ar: "مرفوض"         },
    active     : { fr: "Actif",          en: "Active",        ar: "نشط"           },
    inactive   : { fr: "Inactif",        en: "Inactive",      ar: "غير نشط"       },
    verified   : { fr: "Vérifié",        en: "Verified",      ar: "تم التحقق"     },
    notVerified: { fr: "Non vérifié",    en: "Not verified",  ar: "غير محقق"      },
    online     : { fr: "En ligne",       en: "Online",        ar: "متصل"          },
  },

  // ── Profile page ───────────────────────────────────────────────────────────
  profile: {
    title          : { fr: "Mon profil",            en: "My profile",         ar: "ملفي الشخصي"         },
    myInfo         : { fr: "Mes informations",       en: "My information",     ar: "معلوماتي"             },
    passwordTab    : { fr: "Mot de passe",           en: "Password",           ar: "كلمة المرور"          },
    childrenTab    : { fr: "Mes enfants",            en: "My children",        ar: "أطفالي"              },
    editAvatar     : { fr: "Changer la photo",       en: "Change photo",       ar: "تغيير الصورة"         },
    currentPwd     : { fr: "Mot de passe actuel",    en: "Current password",   ar: "كلمة المرور الحالية"  },
    newPwd         : { fr: "Nouveau mot de passe",   en: "New password",       ar: "كلمة المرور الجديدة"  },
    changePwd      : { fr: "Modifier le mot de passe", en: "Change password",  ar: "تغيير كلمة المرور"    },
    noChildren     : { fr: "Aucun enfant",           en: "No children",        ar: "لا يوجد أطفال"        },
    addChild       : { fr: "Ajouter un enfant",      en: "Add a child",        ar: "إضافة طفل"           },
    diagnostic     : { fr: "Diagnostic",             en: "Diagnostic",         ar: "التشخيص"             },
    backToChat     : { fr: "Retour au chat",         en: "Back to chat",       ar: "العودة للدردشة"       },
    updateSuccess  : { fr: "Informations mises à jour avec succès.", en: "Information updated successfully.", ar: "تم تحديث المعلومات بنجاح." },
    pwdSuccess     : { fr: "Mot de passe modifié avec succès.", en: "Password changed successfully.", ar: "تم تغيير كلمة المرور بنجاح." },
    pwdError       : { fr: "Mot de passe actuel incorrect.", en: "Current password is incorrect.", ar: "كلمة المرور الحالية غير صحيحة." },
  },

  // ── Child ──────────────────────────────────────────────────────────────────
  child: {
    firstName    : { fr: "Prénom",              en: "First name",      ar: "الاسم"              },
    lastName     : { fr: "Nom",                 en: "Last name",       ar: "اللقب"              },
    birthDate    : { fr: "Date de naissance",   en: "Birth date",      ar: "تاريخ الميلاد"      },
    gender       : { fr: "Genre",               en: "Gender",          ar: "الجنس"              },
    boy          : { fr: "Garçon",              en: "Boy",             ar: "ولد"                },
    girl         : { fr: "Fille",               en: "Girl",            ar: "بنت"                },
    age          : { fr: "ans",                 en: "years old",       ar: "سنة"                },
    photo        : { fr: "Photo de visage",     en: "Face photo",      ar: "صورة الوجه"         },
    qchatScore   : { fr: "Score Q-Chat",        en: "Q-Chat score",    ar: "نتيجة Q-Chat"       },
    prediction   : { fr: "Profil estimé",       en: "Estimated profile", ar: "الملف المقدر"     },
    confidence   : { fr: "Confiance",           en: "Confidence",      ar: "الثقة"              },
    notAnalyzed  : { fr: "Pas encore analysé",  en: "Not yet analyzed", ar: "لم يتم التحليل بعد" },
    editChild    : { fr: "Modifier l'enfant",   en: "Edit child",      ar: "تعديل بيانات الطفل" },
    deleteChild  : { fr: "Supprimer l'enfant",  en: "Delete child",    ar: "حذف الطفل"          },
    deleteConfirm: { fr: "Êtes-vous sûr de vouloir supprimer ce profil ?", en: "Are you sure you want to delete this profile?", ar: "هل أنت متأكد من حذف هذا الملف؟" },
  },

  // ── Diagnostic page ────────────────────────────────────────────────────────
  diagnostic: {
    title        : { fr: "Diagnostic",               en: "Diagnostic",           ar: "التشخيص"                },
    subtitle     : { fr: "Résultats de l'analyse ML/CNN pour", en: "ML/CNN analysis results for", ar: "نتائج تحليل ML/CNN لـ" },
    profileResult: { fr: "Profil estimé",             en: "Estimated profile",    ar: "الملف المقدر"            },
    mlModel      : { fr: "Modèle XGBoost (ML)",       en: "XGBoost Model (ML)",   ar: "نموذج XGBoost"          },
    cnnModel     : { fr: "Modèle MobileNetV2 (CNN)",  en: "MobileNetV2 (CNN)",    ar: "نموذج MobileNetV2"      },
    fusionModel  : { fr: "Late Fusion",               en: "Late Fusion",          ar: "دمج متأخر"              },
    rmModel      : { fr: "Isolation Forest (DI)",     en: "Isolation Forest (ID)", ar: "Isolation Forest (إعاقة ذهنية)" },
    probTSA      : { fr: "Probabilité TSA",           en: "ASD probability",      ar: "احتمالية التوحد"        },
    scoreAnomaly : { fr: "Score anomalie (DI)",       en: "Anomaly score (ID)",   ar: "نتيجة الشذوذ (إعاقة ذهنية)" },
    globalConf   : { fr: "Confiance globale",         en: "Global confidence",    ar: "الثقة الإجمالية"        },
    qchatSection : { fr: "Questionnaire Q-Chat-10",   en: "Q-Chat-10 Questionnaire", ar: "استبيان Q-Chat-10"   },
    qchatDesc    : { fr: "Réponses brutes du formulaire", en: "Raw form responses", ar: "إجابات النموذج الخام" },
    profileDetected: { fr: "Profil comportemental détecté", en: "Detected behavioral profile", ar: "الملف السلوكي المكتشف" },
    profileDetectedDesc: { fr: "Observations accumulées par l'IA lors des conversations", en: "AI-accumulated observations from conversations", ar: "الملاحظات المتراكمة من المحادثات" },
    lastAnalysis : { fr: "Dernière analyse",          en: "Last analysis",        ar: "آخر تحليل"              },
    runAnalysis  : { fr: "Relancer l'analyse",        en: "Run analysis again",   ar: "إعادة التحليل"          },
    noAnalysis   : { fr: "Aucune analyse effectuée",  en: "No analysis performed", ar: "لم يتم إجراء تحليل"  },
    medicalNote  : { fr: "Ce résultat est une estimation basée sur des modèles d'apprentissage automatique. Il ne constitue pas un diagnostic médical.", en: "This result is an estimate based on machine learning models. It does not constitute a medical diagnosis.", ar: "هذه النتيجة تقدير بناءً على نماذج تعلم الآلة. لا تشكل تشخيصاً طبياً." },
    profileLabels: {
      TSA   : { fr: "Trouble du Spectre Autistique", en: "Autism Spectrum Disorder", ar: "اضطراب طيف التوحد" },
      RM    : { fr: "Déficience Intellectuelle",     en: "Intellectual Disability",  ar: "إعاقة ذهنية"       },
      MIXTE : { fr: "Profil mixte TSA & DI",         en: "Mixed ASD & ID profile",   ar: "ملف مختلط توحد وإعاقة ذهنية" },
      Normal: { fr: "Profil dans la norme",          en: "Typical profile",          ar: "ملف طبيعي"          },
    },
    qchatAnswers : {
      0: { fr: "Toujours",            en: "Always",         ar: "دائماً"       },
      1: { fr: "Habituellement",      en: "Usually",        ar: "عادةً"        },
      2: { fr: "Parfois",             en: "Sometimes",      ar: "أحياناً"      },
      3: { fr: "Rarement",            en: "Rarely",         ar: "نادراً"       },
      4: { fr: "Jamais",              en: "Never",          ar: "أبداً"        },
    },
  },

  // ── Chat ───────────────────────────────────────────────────────────────────
  chat: {
    newConversation  : { fr: "Nouvelle conversation",  en: "New conversation",     ar: "محادثة جديدة"       },
    conversations    : { fr: "Conversations",          en: "Conversations",        ar: "المحادثات"          },
    typeMessage      : { fr: "Écrivez votre message...", en: "Type your message...", ar: "اكتب رسالتك..."    },
    send             : { fr: "Envoyer",                en: "Send",                 ar: "إرسال"              },
    thinking         : { fr: "En train de répondre...", en: "Thinking...",         ar: "جاري الرد..."       },
    noConversation   : { fr: "Sélectionnez une conversation", en: "Select a conversation", ar: "اختر محادثة" },
    startConversation: { fr: "Commencer une conversation", en: "Start a conversation", ar: "ابدأ محادثة"    },
    greet            : { fr: "Bonjour",                en: "Hello",                ar: "مرحباً"             },
    deleteConv       : { fr: "Supprimer",              en: "Delete",               ar: "حذف"                },
    voiceMessage     : { fr: "Message vocal",          en: "Voice message",        ar: "رسالة صوتية"        },
    recording        : { fr: "Enregistrement",         en: "Recording",            ar: "جاري التسجيل"       },
    attachFile       : { fr: "Joindre un fichier",     en: "Attach file",          ar: "إرفاق ملف"          },
    suggestions      : {
      q1: { fr: "Comment gérer les crises ?",      en: "How to manage meltdowns?",   ar: "كيف أتعامل مع نوبات الغضب؟" },
      q2: { fr: "Méthodes TEACCH à utiliser ?",   en: "TEACCH methods to use?",     ar: "ما هي طرق TEACCH؟"          },
      q3: { fr: "Stimuler la communication ?",    en: "Stimulate communication?",   ar: "كيف أحفز التواصل؟"          },
      q4: { fr: "Que faire face à l'automutilation ?", en: "How to handle self-harm?", ar: "كيف أتعامل مع إيذاء الذات؟" },
    },
  },

  // ── Admin ──────────────────────────────────────────────────────────────────
  admin: {
    dashboard    : { fr: "Tableau de bord",    en: "Dashboard",         ar: "لوحة التحكم"       },
    users        : { fr: "Utilisateurs",       en: "Users",             ar: "المستخدمون"         },
    children     : { fr: "Enfants",            en: "Children",          ar: "الأطفال"            },
    evaluations  : { fr: "Évaluations",        en: "Evaluations",       ar: "التقييمات"          },
    nlp          : { fr: "Analyse NLP",        en: "NLP Analysis",      ar: "تحليل NLP"          },
    platform     : { fr: "Plateforme Ma Chance", en: "Ma Chance Platform", ar: "منصة ما شانس"   },
    totalUsers   : { fr: "Parents inscrits",   en: "Registered parents", ar: "الآباء المسجلون"  },
    totalChildren: { fr: "Enfants suivis",     en: "Children tracked",  ar: "الأطفال المتابعون" },
    totalMessages: { fr: "Messages parents",   en: "Parent messages",   ar: "رسائل الآباء"      },
    totalSessions: { fr: "Sessions d'évaluation", en: "Evaluation sessions", ar: "جلسات التقييم" },
    approve      : { fr: "Approuver",          en: "Approve",           ar: "الموافقة"           },
    revoke       : { fr: "Révoquer l'accès",   en: "Revoke access",     ar: "إلغاء الوصول"       },
    editUser     : { fr: "Modifier l'utilisateur", en: "Edit user",     ar: "تعديل المستخدم"     },
    deleteUser   : { fr: "Supprimer l'utilisateur", en: "Delete user",  ar: "حذف المستخدم"      },
    editChild    : { fr: "Modifier l'enfant",  en: "Edit child",        ar: "تعديل الطفل"        },
    deleteChild  : { fr: "Supprimer l'enfant", en: "Delete child",      ar: "حذف الطفل"          },
    viewDetails  : { fr: "Voir les détails",   en: "View details",      ar: "عرض التفاصيل"       },
    allChildren  : { fr: "Tous les enfants",   en: "All children",      ar: "جميع الأطفال"       },
    childDetails : { fr: "Détails de l'enfant", en: "Child details",    ar: "تفاصيل الطفل"       },
    confirmDelete: { fr: "Confirmer la suppression", en: "Confirm deletion", ar: "تأكيد الحذف"   },
    deleteMsg    : { fr: "Cette action est irréversible.", en: "This action is irreversible.", ar: "هذا الإجراء لا يمكن التراجع عنه." },
  },

  // ── Errors ─────────────────────────────────────────────────────────────────
  errors: {
    required     : { fr: "Ce champ est requis",       en: "This field is required",    ar: "هذا الحقل مطلوب"       },
    emailInvalid : { fr: "Email invalide",            en: "Invalid email",             ar: "بريد إلكتروني غير صالح" },
    pwdMin       : { fr: "8 caractères minimum",      en: "Minimum 8 characters",      ar: "8 أحرف على الأقل"       },
    pwdMatch     : { fr: "Les mots de passe ne correspondent pas", en: "Passwords don't match", ar: "كلمتا المرور غير متطابقتين" },
    serverError  : { fr: "Erreur serveur. Réessayez.", en: "Server error. Try again.", ar: "خطأ في الخادم. حاول مرة أخرى." },
    notFound     : { fr: "Non trouvé",                en: "Not found",                 ar: "غير موجود"              },
    unauthorized : { fr: "Non autorisé",              en: "Unauthorized",              ar: "غير مصرح"              },
  },

  // ── Misc ───────────────────────────────────────────────────────────────────
  misc: {
    yes          : { fr: "Oui",      en: "Yes",    ar: "نعم"   },
    no           : { fr: "Non",      en: "No",     ar: "لا"    },
    male         : { fr: "Garçon",   en: "Boy",    ar: "ذكر"   },
    female       : { fr: "Fille",    en: "Girl",   ar: "أنثى"  },
    french       : { fr: "Français", en: "French", ar: "الفرنسية" },
    arabic       : { fr: "Arabe",    en: "Arabic", ar: "العربية"  },
    english      : { fr: "Anglais",  en: "English",ar: "الإنجليزية" },
    week         : { fr: "cette semaine", en: "this week", ar: "هذا الأسبوع" },
    today        : { fr: "aujourd'hui",   en: "today",     ar: "اليوم"       },
    at           : { fr: "à",            en: "at",        ar: "في"          },
    of           : { fr: "de",           en: "of",        ar: "من"          },
  },
};

export default translations;