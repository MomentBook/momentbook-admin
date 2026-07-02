import {
  type Language,
  toLocaleTag,
} from "@/lib/i18n/config";
import type { EditorialArticleCategory } from "./types";

type GuidesCopy = {
  listEyebrow: string;
  listTitle: string;
  listDescription: string;
  coverStoryLabel: string;
  discoverLabel: string;
  issueLabel: string;
  emptyTitle: string;
  emptyBody: string;
  readTimeLabel: string;
  readGuideLabel: string;
  publishedLabel: string;
  updatedLabel: string;
  backToGuides: string;
  sourcesTitle: string;
  tocTitle: string;
  relatedTitle: string;
  relatedBody: string;
  quietCtaEyebrow: string;
  quietCtaTitle: string;
  quietCtaBody: string;
  quietCtaButton: string;
  bylinePrefix: string;
};

const guidesCopyByLanguage: Record<Language, GuidesCopy> = {
  en: {
    listEyebrow: "Editorial Guides",
    listTitle: "Editorial guides on travel, memory, and everyday attention",
    listDescription: "",
    coverStoryLabel: "Cover Story",
    discoverLabel: "Discover",
    issueLabel: "Issue No.",
    emptyTitle: "No published guides yet",
    emptyBody: "Published guides will appear here once the editorial queue is ready.",
    readTimeLabel: "min read",
    readGuideLabel: "Read Guide",
    publishedLabel: "Published",
    updatedLabel: "Updated",
    backToGuides: "Back to guides",
    sourcesTitle: "Sources",
    tocTitle: "On this page",
    relatedTitle: "Related guides",
    relatedBody: "More editorial reads from the same guide archive.",
    quietCtaEyebrow: "MomentBook",
    quietCtaTitle: "Turn meaningful moments into a quieter archive",
    quietCtaBody:
      "MomentBook organizes photos by time and place so the scenes that matter stay easy to revisit.",
    quietCtaButton: "Download MomentBook",
    bylinePrefix: "By",
  },
  ko: {
    listEyebrow: "에디토리얼 가이드",
    listTitle: "여행, 기억, 일상의 주의를 다루는 에디토리얼 가이드",
    listDescription: "",
    coverStoryLabel: "대표 가이드",
    discoverLabel: "둘러보기",
    issueLabel: "가이드 No.",
    emptyTitle: "아직 공개된 가이드가 없습니다",
    emptyBody: "게시된 가이드는 준비가 끝나는 대로 이곳에 나타납니다.",
    readTimeLabel: "분 읽기",
    readGuideLabel: "가이드 읽기",
    publishedLabel: "게시일",
    updatedLabel: "수정일",
    backToGuides: "가이드 목록으로",
    sourcesTitle: "참고 자료",
    tocTitle: "이 글의 구성",
    relatedTitle: "함께 읽을 가이드",
    relatedBody: "같은 가이드 아카이브에서 이어 읽을 수 있는 다른 편집 글입니다.",
    quietCtaEyebrow: "MomentBook",
    quietCtaTitle: "의미 있는 순간을 더 조용한 아카이브로 남겨두세요",
    quietCtaBody:
      "MomentBook은 사진을 시간과 장소 기준으로 정리해, 나중에 중요한 장면을 다시 떠올리기 쉽게 남깁니다.",
    quietCtaButton: "MomentBook 다운로드",
    bylinePrefix: "작성",
  },
  ja: {
    listEyebrow: "編集ガイド",
    listTitle: "旅、記憶、日々のまなざしを扱う編集ガイド",
    listDescription: "",
    coverStoryLabel: "特集",
    discoverLabel: "見る",
    issueLabel: "第",
    emptyTitle: "公開中のガイドはまだありません",
    emptyBody: "公開されたガイドは、準備が整い次第ここに表示されます。",
    readTimeLabel: "分で読めます",
    readGuideLabel: "ガイドを読む",
    publishedLabel: "公開",
    updatedLabel: "更新",
    backToGuides: "ガイド一覧へ戻る",
    sourcesTitle: "参考リンク",
    tocTitle: "このページの内容",
    relatedTitle: "関連ガイド",
    relatedBody: "同じガイドアーカイブで続けて読める編集記事です。",
    quietCtaEyebrow: "MomentBook",
    quietCtaTitle: "大切な瞬間を、あとで静かに戻れるアーカイブへ",
    quietCtaBody:
      "MomentBook は写真を時間と場所で整理し、大事だった場面にあとから戻りやすくします。",
    quietCtaButton: "MomentBook をダウンロード",
    bylinePrefix: "文",
  },
  zh: {
    listEyebrow: "编辑指南",
    listTitle: "围绕旅行、记忆与日常觉察的编辑指南",
    listDescription: "",
    coverStoryLabel: "重点推荐",
    discoverLabel: "发现",
    issueLabel: "第",
    emptyTitle: "暂时还没有已发布的指南",
    emptyBody: "已发布的指南会在准备完成后出现在这里。",
    readTimeLabel: "分钟阅读",
    readGuideLabel: "阅读指南",
    publishedLabel: "发布",
    updatedLabel: "更新",
    backToGuides: "返回指南列表",
    sourcesTitle: "参考资料",
    tocTitle: "本文目录",
    relatedTitle: "相关指南",
    relatedBody: "同一指南档案中可继续阅读的其他编辑文章。",
    quietCtaEyebrow: "MomentBook",
    quietCtaTitle: "把重要瞬间留成更安静的档案",
    quietCtaBody:
      "MomentBook 会按时间与地点整理照片，让真正重要的画面更容易在以后被重新想起。",
    quietCtaButton: "下载 MomentBook",
    bylinePrefix: "作者",
  },
  es: {
    listEyebrow: "Guías editoriales",
    listTitle: "Guías editoriales sobre viaje, memoria y atención cotidiana",
    listDescription: "",
    coverStoryLabel: "Portada",
    discoverLabel: "Descubrir",
    issueLabel: "Edición",
    emptyTitle: "Todavía no hay guías publicadas",
    emptyBody: "Las guías publicadas aparecerán aquí cuando la cola editorial esté lista.",
    readTimeLabel: "min de lectura",
    readGuideLabel: "Leer guía",
    publishedLabel: "Publicado",
    updatedLabel: "Actualizado",
    backToGuides: "Volver a las guías",
    sourcesTitle: "Fuentes",
    tocTitle: "En esta página",
    relatedTitle: "Guías relacionadas",
    relatedBody: "Más lecturas editoriales dentro del mismo archivo de guías.",
    quietCtaEyebrow: "MomentBook",
    quietCtaTitle: "Convierte los momentos importantes en un archivo más silencioso",
    quietCtaBody:
      "MomentBook organiza las fotos por tiempo y lugar para que las escenas que importan sigan siendo fáciles de revisitar.",
    quietCtaButton: "Descargar MomentBook",
    bylinePrefix: "Por",
  },
  pt: {
    listEyebrow: "Guias editoriais",
    listTitle: "Guias editoriais sobre viagem, memória e atenção cotidiana",
    listDescription: "",
    coverStoryLabel: "Capa",
    discoverLabel: "Descobrir",
    issueLabel: "Edição",
    emptyTitle: "Ainda não há guias publicados",
    emptyBody: "Os guias publicados aparecerão aqui assim que a fila editorial estiver pronta.",
    readTimeLabel: "min de leitura",
    readGuideLabel: "Ler guia",
    publishedLabel: "Publicado",
    updatedLabel: "Atualizado",
    backToGuides: "Voltar aos guias",
    sourcesTitle: "Fontes",
    tocTitle: "Nesta página",
    relatedTitle: "Guias relacionados",
    relatedBody: "Outras leituras editoriais dentro do mesmo arquivo de guias.",
    quietCtaEyebrow: "MomentBook",
    quietCtaTitle: "Transforme momentos importantes em um arquivo mais tranquilo",
    quietCtaBody:
      "MomentBook organiza fotos por tempo e lugar para que as cenas que importam continuem fáceis de revisitar.",
    quietCtaButton: "Baixar MomentBook",
    bylinePrefix: "Por",
  },
  fr: {
    listEyebrow: "Guides éditoriaux",
    listTitle: "Guides éditoriaux sur le voyage, la mémoire et l'attention au quotidien",
    listDescription: "",
    coverStoryLabel: "À la une",
    discoverLabel: "Explorer",
    issueLabel: "Édition",
    emptyTitle: "Aucun guide publié pour le moment",
    emptyBody: "Les guides publiés apparaîtront ici dès que la file éditoriale sera prête.",
    readTimeLabel: "min de lecture",
    readGuideLabel: "Lire le guide",
    publishedLabel: "Publié",
    updatedLabel: "Mis à jour",
    backToGuides: "Retour aux guides",
    sourcesTitle: "Sources",
    tocTitle: "Sur cette page",
    relatedTitle: "Guides liés",
    relatedBody: "D'autres lectures éditoriales à retrouver dans la même archive de guides.",
    quietCtaEyebrow: "MomentBook",
    quietCtaTitle: "Transformez les moments importants en une archive plus calme",
    quietCtaBody:
      "MomentBook organise les photos par temps et par lieu pour que les scènes importantes restent faciles à revisiter.",
    quietCtaButton: "Télécharger MomentBook",
    bylinePrefix: "Par",
  },
  th: {
    listEyebrow: "คู่มือบรรณาธิการ",
    listTitle: "คู่มือบรรณาธิการว่าด้วยการเดินทาง ความทรงจำ และการใส่ใจในชีวิตประจำวัน",
    listDescription: "",
    coverStoryLabel: "เรื่องเด่น",
    discoverLabel: "สำรวจ",
    issueLabel: "ฉบับที่",
    emptyTitle: "ยังไม่มีไกด์ที่เผยแพร่",
    emptyBody: "เมื่อกองบรรณาธิการพร้อมแล้ว ไกด์ที่เผยแพร่จะปรากฏที่นี่",
    readTimeLabel: "นาทีอ่าน",
    readGuideLabel: "อ่านไกด์",
    publishedLabel: "เผยแพร่",
    updatedLabel: "อัปเดต",
    backToGuides: "กลับไปหน้าไกด์",
    sourcesTitle: "แหล่งอ้างอิง",
    tocTitle: "เนื้อหาในหน้านี้",
    relatedTitle: "ไกด์ที่เกี่ยวข้อง",
    relatedBody: "บทความบรรณาธิการอื่นในคลังไกด์เดียวกัน",
    quietCtaEyebrow: "MomentBook",
    quietCtaTitle: "เปลี่ยนช่วงเวลาสำคัญให้เป็นคลังที่สงบกว่าเดิม",
    quietCtaBody:
      "MomentBook จัดภาพตามเวลาและสถานที่ เพื่อให้ภาพที่มีความหมายยังกลับมาดูได้ง่ายในภายหลัง",
    quietCtaButton: "ดาวน์โหลด MomentBook",
    bylinePrefix: "โดย",
  },
  vi: {
    listEyebrow: "Hướng dẫn biên tập",
    listTitle: "Hướng dẫn biên tập về du lịch, ký ức và sự chú ý trong đời sống hằng ngày",
    listDescription: "",
    coverStoryLabel: "Bài nổi bật",
    discoverLabel: "Khám phá",
    issueLabel: "Số",
    emptyTitle: "Chưa có hướng dẫn nào được xuất bản",
    emptyBody: "Các hướng dẫn đã xuất bản sẽ xuất hiện ở đây khi hàng đợi biên tập sẵn sàng.",
    readTimeLabel: "phút đọc",
    readGuideLabel: "Đọc hướng dẫn",
    publishedLabel: "Xuất bản",
    updatedLabel: "Cập nhật",
    backToGuides: "Quay lại hướng dẫn",
    sourcesTitle: "Nguồn tham khảo",
    tocTitle: "Trong trang này",
    relatedTitle: "Hướng dẫn liên quan",
    relatedBody: "Các bài đọc biên tập khác trong cùng kho hướng dẫn.",
    quietCtaEyebrow: "MomentBook",
    quietCtaTitle: "Biến những khoảnh khắc quan trọng thành một kho lưu trữ yên hơn",
    quietCtaBody:
      "MomentBook sắp xếp ảnh theo thời gian và địa điểm để những khung cảnh quan trọng vẫn dễ quay lại về sau.",
    quietCtaButton: "Tải MomentBook",
    bylinePrefix: "Bởi",
  },
};

const categoryLabels: Record<
  Language,
  Record<EditorialArticleCategory, string>
> = {
  en: {
    festival: "Festival Guide",
    "travel-guide": "Travel Guide",
    "destination-guide": "Destination Guide",
    "wellbeing-guide": "Wellbeing Guide",
  },
  ko: {
    festival: "축제 가이드",
    "travel-guide": "여행 가이드",
    "destination-guide": "목적지 가이드",
    "wellbeing-guide": "웰빙 가이드",
  },
  ja: {
    festival: "祭りガイド",
    "travel-guide": "旅ガイド",
    "destination-guide": "目的地ガイド",
    "wellbeing-guide": "ウェルビーイングガイド",
  },
  zh: {
    festival: "节庆指南",
    "travel-guide": "旅行指南",
    "destination-guide": "目的地指南",
    "wellbeing-guide": "身心健康指南",
  },
  es: {
    festival: "Guía de festival",
    "travel-guide": "Guía de viaje",
    "destination-guide": "Guía de destino",
    "wellbeing-guide": "Guía de bienestar",
  },
  pt: {
    festival: "Guia de festival",
    "travel-guide": "Guia de viagem",
    "destination-guide": "Guia de destino",
    "wellbeing-guide": "Guia de bem-estar",
  },
  fr: {
    festival: "Guide festival",
    "travel-guide": "Guide voyage",
    "destination-guide": "Guide destination",
    "wellbeing-guide": "Guide bien-être",
  },
  th: {
    festival: "คู่มือเทศกาล",
    "travel-guide": "คู่มือท่องเที่ยว",
    "destination-guide": "คู่มือจุดหมายปลายทาง",
    "wellbeing-guide": "คู่มือสุขภาวะ",
  },
  vi: {
    festival: "Hướng dẫn lễ hội",
    "travel-guide": "Hướng dẫn du lịch",
    "destination-guide": "Hướng dẫn điểm đến",
    "wellbeing-guide": "Hướng dẫn sức khỏe tinh thần",
  },
};

const categoryFilterLabels: Record<
  Language,
  Record<EditorialArticleCategory, string>
> = {
  en: {
    festival: "Festival",
    "travel-guide": "Travel",
    "destination-guide": "Destination",
    "wellbeing-guide": "Wellbeing",
  },
  ko: {
    festival: "축제",
    "travel-guide": "여행",
    "destination-guide": "목적지",
    "wellbeing-guide": "웰빙",
  },
  ja: {
    festival: "祭り",
    "travel-guide": "旅",
    "destination-guide": "目的地",
    "wellbeing-guide": "ウェルビーイング",
  },
  zh: {
    festival: "节庆",
    "travel-guide": "旅行",
    "destination-guide": "目的地",
    "wellbeing-guide": "身心健康",
  },
  es: {
    festival: "Festival",
    "travel-guide": "Viaje",
    "destination-guide": "Destino",
    "wellbeing-guide": "Bienestar",
  },
  pt: {
    festival: "Festival",
    "travel-guide": "Viagem",
    "destination-guide": "Destino",
    "wellbeing-guide": "Bem-estar",
  },
  fr: {
    festival: "Festival",
    "travel-guide": "Voyage",
    "destination-guide": "Destination",
    "wellbeing-guide": "Bien-être",
  },
  th: {
    festival: "เทศกาล",
    "travel-guide": "ท่องเที่ยว",
    "destination-guide": "จุดหมายปลายทาง",
    "wellbeing-guide": "สุขภาวะ",
  },
  vi: {
    festival: "Lễ hội",
    "travel-guide": "Du lịch",
    "destination-guide": "Điểm đến",
    "wellbeing-guide": "Sức khỏe tinh thần",
  },
};

export function getGuidesCopy(lang: Language): GuidesCopy {
  return guidesCopyByLanguage[lang] ?? guidesCopyByLanguage.en;
}

export function getEditorialCategoryLabel(
  lang: Language,
  category: EditorialArticleCategory,
): string {
  return categoryLabels[lang]?.[category] ?? categoryLabels.en[category];
}

export function getEditorialCategoryFilterLabel(
  lang: Language,
  category: EditorialArticleCategory,
): string {
  return categoryFilterLabels[lang]?.[category] ?? categoryFilterLabels.en[category];
}

export function getEditorialCountryName(
  lang: Language,
  country: string,
): string {
  const normalized = country.trim();
  if (!normalized) {
    return "";
  }

  if (!/^[A-Za-z]{2,3}$/u.test(normalized)) {
    return normalized;
  }

  try {
    const formatter = new Intl.DisplayNames([toLocaleTag(lang)], {
      type: "region",
    });

    return formatter.of(normalized.toUpperCase()) ?? normalized.toUpperCase();
  } catch {
    return normalized.toUpperCase();
  }
}

export function formatGuideReadTime(lang: Language, minutes: number): string {
  const copy = getGuidesCopy(lang);
  return `${new Intl.NumberFormat(lang).format(minutes)} ${copy.readTimeLabel}`;
}
