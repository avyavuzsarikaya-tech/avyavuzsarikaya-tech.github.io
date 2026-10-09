import type { Lang } from "../types.ts";

/** Words for the membership, payment and newsletter pages, in the five languages. */
export type PagesCopy = {
  membership: {
    title: string;
    lead: string;
    free: { name: string; price: string; points: string[]; action: string };
    paid: { name: string; points: string[]; action: string };
    perMonth: string;
    perYear: string;
    or: string;
    haveAccount: string;
    signIn: string;
  };
  payment: {
    title: string;
    lead: string;
    period: string;
    monthly: string;
    yearly: string;
    yearlyNote: string;
    summary: string;
    plan: string;
    total: string;
    includes: string;
    pay: string;
    waiting: string;
    back: string;
  };
  newsletter: {
    title: string;
    lead: string;
    soon: string;
    soonNote: string;
  };
  /** The account page while sign-up is not yet switched on. */
  accountSoon: string;
  seePlans: string;
  /** Under a reading while comments are not yet switched on. */
  joinToComment: string;
};

const COPY: Record<Lang, PagesCopy> = {
  tr: {
    membership: {
      title: "Üyelik",
      lead: "Orbis’teki okumaların çoğu herkese açık. Üye olarak yazıların altında yorum yazabilir, destekçi üyelikle üyelere özel yazılara ve videolara erişip Orbis’in bağımsız çalışmasına katkı verebilirsiniz.",
      free: {
        name: "Ücretsiz üyelik",
        price: "Ücretsiz",
        points: ["Yazıların altında yorum yazma", "Yorumlarda görünecek adınızı seçme"],
        action: "Ücretsiz üye ol",
      },
      paid: {
        name: "Destekçi üyelik",
        points: [
          "Üyelere özel yazıların tamamı",
          "Üyelere özel videolar",
          "Ücretsiz üyeliğin bütün imkânları",
          "Kaynaklara dayalı, bağımsız yayıncılığa doğrudan destek",
        ],
        action: "Destekçi ol",
      },
      perMonth: "ay",
      perYear: "yıl",
      or: "ya da",
      haveAccount: "Zaten üye misiniz?",
      signIn: "Giriş yapın",
    },
    payment: {
      title: "Ödeme",
      lead: "Destekçi üyelik için bir dönem seçin.",
      period: "Dönem",
      monthly: "Aylık",
      yearly: "Yıllık",
      yearlyNote: "İki ay ücretsiz",
      summary: "Özet",
      plan: "Destekçi üyelik",
      total: "Toplam",
      includes: "Üyeliğe dahil olanlar",
      pay: "Ödemeye geç",
      waiting:
        "Kartla ödeme kısa süre içinde açılıyor. Açıldığında bu düğme sizi güvenli ödeme sayfasına götürecek.",
      back: "Üyelik seçeneklerine dön",
    },
    newsletter: {
      title: "Bülten",
      lead: "Orbis Bülteni, yeni yayımlanan okumaları ve arşivden seçilmiş yazıları belli aralıklarla e-posta kutunuza getirecek.",
      soon: "Bülten yakında faaliyete geçecek.",
      soonNote: "Kayıt formu açıldığında bu sayfada yer alacak.",
    },
    accountSoon: "Üye kayıtları kısa süre içinde açılıyor.",
    seePlans: "Üyelik seçeneklerine bakın",
    joinToComment: "Yorum yazmak için üye olun.",
  },
  ar: {
    membership: {
      title: "العضوية",
      lead: "معظم قراءات أوربيس متاحة للجميع. بالعضوية يمكنك التعليق تحت المقالات، وبعضوية الداعم تصل إلى المقالات والفيديوهات الخاصة بالأعضاء وتسهم في عمل أوربيس المستقل.",
      free: {
        name: "العضوية المجانية",
        price: "مجانًا",
        points: ["التعليق تحت المقالات", "اختيار الاسم الظاهر في التعليقات"],
        action: "انضم مجانًا",
      },
      paid: {
        name: "عضوية الداعم",
        points: [
          "المقالات الخاصة بالأعضاء كاملة",
          "الفيديوهات الخاصة بالأعضاء",
          "كل ما في العضوية المجانية",
          "دعم مباشر لنشر مستقل قائم على المصادر",
        ],
        action: "كن داعمًا",
      },
      perMonth: "شهريًا",
      perYear: "سنويًا",
      or: "أو",
      haveAccount: "أنت عضو بالفعل؟",
      signIn: "سجّل الدخول",
    },
    payment: {
      title: "الدفع",
      lead: "اختر مدة عضوية الداعم.",
      period: "المدة",
      monthly: "شهري",
      yearly: "سنوي",
      yearlyNote: "شهران مجانًا",
      summary: "الملخص",
      plan: "عضوية الداعم",
      total: "المجموع",
      includes: "ما تشمله العضوية",
      pay: "تابع إلى الدفع",
      waiting: "يُفتح الدفع بالبطاقة قريبًا. عندها ينقلك هذا الزر إلى صفحة دفع آمنة.",
      back: "العودة إلى خيارات العضوية",
    },
    newsletter: {
      title: "النشرة",
      lead: "ستحمل نشرة أوربيس إلى بريدك، على فترات منتظمة، القراءات الجديدة ومقالات مختارة من الأرشيف.",
      soon: "تبدأ النشرة قريبًا.",
      soonNote: "سيظهر نموذج الاشتراك في هذه الصفحة عند افتتاحها.",
    },
    accountSoon: "يُفتح تسجيل الأعضاء قريبًا.",
    seePlans: "اطّلع على خيارات العضوية",
    joinToComment: "انضم لتكتب تعليقًا.",
  },
  en: {
    membership: {
      title: "Membership",
      lead: "Most Orbis readings are open to everyone. As a member you can comment under the readings; as a supporting member you also read the members-only pieces, watch the members-only videos and help keep Orbis independent.",
      free: {
        name: "Free membership",
        price: "Free",
        points: ["Comment under the readings", "Choose the name shown on your comments"],
        action: "Join free",
      },
      paid: {
        name: "Supporting membership",
        points: [
          "Members-only readings in full",
          "Members-only videos",
          "Everything in free membership",
          "Direct support for sourced, independent publishing",
        ],
        action: "Become a supporter",
      },
      perMonth: "month",
      perYear: "year",
      or: "or",
      haveAccount: "Already a member?",
      signIn: "Sign in",
    },
    payment: {
      title: "Payment",
      lead: "Choose a period for your supporting membership.",
      period: "Period",
      monthly: "Monthly",
      yearly: "Yearly",
      yearlyNote: "Two months free",
      summary: "Summary",
      plan: "Supporting membership",
      total: "Total",
      includes: "Included",
      pay: "Continue to payment",
      waiting:
        "Card payment opens shortly. When it does, this button will take you to a secure checkout page.",
      back: "Back to membership options",
    },
    newsletter: {
      title: "Newsletter",
      lead: "The Orbis newsletter will bring new readings and pieces chosen from the archive to your inbox at regular intervals.",
      soon: "The newsletter is launching soon.",
      soonNote: "The sign-up form will appear on this page when it opens.",
    },
    accountSoon: "Member sign-up opens shortly.",
    seePlans: "See membership options",
    joinToComment: "Join to comment.",
  },
  fr: {
    membership: {
      title: "Adhésion",
      lead: "La plupart des lectures d’Orbis sont ouvertes à tous. Membre, vous pouvez commenter sous les textes ; membre bienfaiteur, vous lisez aussi les textes et regardez les vidéos réservés aux membres, et soutenez l’indépendance d’Orbis.",
      free: {
        name: "Adhésion gratuite",
        price: "Gratuit",
        points: ["Commenter sous les lectures", "Choisir le nom affiché sur vos commentaires"],
        action: "Adhérer gratuitement",
      },
      paid: {
        name: "Adhésion bienfaiteur",
        points: [
          "Les textes réservés aux membres, en entier",
          "Les vidéos réservées aux membres",
          "Tout ce que comprend l’adhésion gratuite",
          "Un soutien direct à une publication sourcée et indépendante",
        ],
        action: "Devenir bienfaiteur",
      },
      perMonth: "mois",
      perYear: "an",
      or: "ou",
      haveAccount: "Déjà membre ?",
      signIn: "Se connecter",
    },
    payment: {
      title: "Paiement",
      lead: "Choisissez la durée de votre adhésion bienfaiteur.",
      period: "Durée",
      monthly: "Mensuelle",
      yearly: "Annuelle",
      yearlyNote: "Deux mois offerts",
      summary: "Récapitulatif",
      plan: "Adhésion bienfaiteur",
      total: "Total",
      includes: "Ce qui est compris",
      pay: "Passer au paiement",
      waiting:
        "Le paiement par carte ouvre sous peu. Ce bouton mènera alors à une page de paiement sécurisée.",
      back: "Retour aux formules d’adhésion",
    },
    newsletter: {
      title: "Lettre d’information",
      lead: "La lettre d’Orbis apportera dans votre boîte, à intervalles réguliers, les nouvelles lectures et des textes choisis dans les archives.",
      soon: "La lettre d’information sera bientôt lancée.",
      soonNote: "Le formulaire d’inscription apparaîtra sur cette page à son ouverture.",
    },
    accountSoon: "Les inscriptions ouvrent sous peu.",
    seePlans: "Voir les formules d’adhésion",
    joinToComment: "Adhérez pour commenter.",
  },
  es: {
    membership: {
      title: "Membresía",
      lead: "La mayoría de las lecturas de Orbis están abiertas a todos. Como miembro puede comentar bajo los textos; como miembro benefactor lee además los textos y ve los vídeos reservados a miembros, y ayuda a que Orbis siga siendo independiente.",
      free: {
        name: "Membresía gratuita",
        price: "Gratis",
        points: ["Comentar bajo las lecturas", "Elegir el nombre que aparece en sus comentarios"],
        action: "Unirse gratis",
      },
      paid: {
        name: "Membresía benefactora",
        points: [
          "Los textos para miembros, completos",
          "Los vídeos para miembros",
          "Todo lo de la membresía gratuita",
          "Apoyo directo a una publicación independiente y con fuentes",
        ],
        action: "Hacerse benefactor",
      },
      perMonth: "mes",
      perYear: "año",
      or: "o",
      haveAccount: "¿Ya es miembro?",
      signIn: "Inicie sesión",
    },
    payment: {
      title: "Pago",
      lead: "Elija el periodo de su membresía benefactora.",
      period: "Periodo",
      monthly: "Mensual",
      yearly: "Anual",
      yearlyNote: "Dos meses gratis",
      summary: "Resumen",
      plan: "Membresía benefactora",
      total: "Total",
      includes: "Incluye",
      pay: "Continuar al pago",
      waiting:
        "El pago con tarjeta se abre en breve. Entonces este botón le llevará a una página de pago segura.",
      back: "Volver a las opciones de membresía",
    },
    newsletter: {
      title: "Boletín",
      lead: "El boletín de Orbis llevará a su correo, a intervalos regulares, las nuevas lecturas y textos elegidos del archivo.",
      soon: "El boletín empezará pronto.",
      soonNote: "El formulario de suscripción aparecerá en esta página cuando se abra.",
    },
    accountSoon: "El registro de miembros se abre en breve.",
    seePlans: "Ver las opciones de membresía",
    joinToComment: "Únase para comentar.",
  },
};

export function pagesCopy(lang: Lang): PagesCopy {
  return COPY[lang];
}
