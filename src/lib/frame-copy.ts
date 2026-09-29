import type { Lang } from "@/lib/types";

/** Words for the site frame: section bar, side column, footer. */
export type FrameCopy = {
  all: string;
  about: string;
  index: string;
  emptySection: string;
  principle: string;
  languages: string;
  rights: string;
};

const frame: Record<Lang, FrameCopy> = {
  tr: {
    all: "Tümü",
    about: "Orbis hakkında",
    index: "Dizin",
    emptySection: "Bu bölümde henüz okuma yok.",
    principle: "Her okuma kamusal belgelere dayanır. Son dakika masası da görüş sayfası da yoktur.",
    languages: "Diller",
    rights: "Tüm hakları saklıdır.",
  },
  ar: {
    all: "الكل",
    about: "عن أوربيس",
    index: "الفهرس",
    emptySection: "لا توجد قراءات في هذا القسم بعد.",
    principle: "كل قراءة تستند إلى وثائق عامة. لا مكتب للأخبار العاجلة ولا صفحة للرأي.",
    languages: "اللغات",
    rights: "جميع الحقوق محفوظة.",
  },
  en: {
    all: "All",
    about: "About Orbis",
    index: "Index",
    emptySection: "No readings in this section yet.",
    principle: "Every reading rests on public documents. There is no breaking-news desk and no opinion page.",
    languages: "Languages",
    rights: "All rights reserved.",
  },
  fr: {
    all: "Tout",
    about: "À propos d’Orbis",
    index: "Index",
    emptySection: "Aucune lecture dans cette rubrique pour l’instant.",
    principle: "Chaque lecture s’appuie sur des documents publics. Ni desk d’urgence, ni page d’opinion.",
    languages: "Langues",
    rights: "Tous droits réservés.",
  },
  es: {
    all: "Todo",
    about: "Sobre Orbis",
    index: "Índice",
    emptySection: "Todavía no hay lecturas en esta sección.",
    principle: "Cada lectura se apoya en documentos públicos. No hay mesa de última hora ni página de opinión.",
    languages: "Idiomas",
    rights: "Todos los derechos reservados.",
  },
};

export function useFrameCopy(lang: Lang): FrameCopy {
  return frame[lang];
}
