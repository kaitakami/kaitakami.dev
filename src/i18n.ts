export const locales = ["en", "es", "pt", "ja", "ko"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const isLocale = (s: string | undefined): s is Locale => locales.includes(s as Locale);

/** "/blog/x" in a locale: English lives at the root, the rest under /<code>. */
export const localePath = (locale: Locale, path: string) =>
  locale === defaultLocale ? path : path === "/" ? `/${locale}` : `/${locale}${path}`;

/** "/es/blog/x" → "/blog/x" */
export const stripLocale = (path: string) => {
  const [, first, ...rest] = path.split("/");
  if (!isLocale(first) || first === defaultLocale) return path.replace(/\/$/, "") || "/";
  return `/${rest.join("/")}`.replace(/\/$/, "") || "/";
};

type Dict = {
  name: string;
  intl: string;
  description: string;
  sceneLabel: string;
  rows: { now: [string, string]; lately: [string, string]; off: [string, string] };
  elsewhere: string;
  writing: string;
  writingDescription: string;
  minutes: (n: number) => string;
  reads: (n: string, plural: Intl.LDMLPluralRule) => string;
  switchLabel: string;
  updates: string;
  updatesDescription: string;
  latest: string;
  allUpdates: string;
  subscribe: {
    label: string;
    lead: string;
    placeholder: string;
    button: string;
    ok: string;
    invalid: string;
    error: string;
    rss: string;
  };
};

const domu = `<a href="https://domu.ai?ref=kaitakami.dev">Domu</a>`;

export const dict: Record<Locale, Dict> = {
  en: {
    name: "English",
    intl: "en-US",
    description: "Kai Takami, CTO at Domu. Distributed systems, Postgres, road bikes.",
    sceneLabel: "The Seto Inland Sea, live with your local time and weather: a suspension bridge to Awaji, and a road bike leaning on the sea wall",
    rows: {
      now: [
        "Now",
        `CTO at ${domu} (YC S24). We build AI voice agents for top-10 banks in more than 4 countries. 120M+ calls a month.`,
      ],
      lately: ["Lately", "Hiring engineers, and turning a bunch of serverless services back into something a few people can keep in their heads :)"],
      off: ["Also", "Road bikes. Trying to run 5 km in under 20 minutes. Postgres tables with twelve-digit row counts, which is also work."],
    },
    elsewhere: "Elsewhere",
    writing: "Writing",
    writingDescription: "Essays by Kai Takami.",
    minutes: (n) => `${n} min`,
    reads: (n, p) => `${n} ${p === "one" ? "read" : "reads"}`,
    switchLabel: "Language",
    updates: "Notes",
    updatesDescription: "Short notes from Kai Takami: where I am, what I am up to.",
    latest: "Notes",
    allUpdates: "All notes",
    subscribe: {
      label: "Subscribe",
      lead: "New writing and notes, by email. Not often.",
      placeholder: "you@example.com",
      button: "Subscribe",
      ok: "You're in. Thanks.",
      invalid: "That email doesn't look right.",
      error: "Couldn't save that. Try again in a bit.",
      rss: "or RSS",
    },
  },
  es: {
    name: "Español",
    intl: "es-MX",
    description: "Kai Takami, CTO en Domu. Sistemas distribuidos, Postgres, bicis de ruta.",
    sceneLabel: "El mar interior de Seto, con tu hora y tu clima: un puente colgante hacia Awaji y una bici de ruta recargada en el malecón",
    rows: {
      now: [
        "Ahora",
        `CTO en ${domu} (YC S24). Hacemos agentes de voz con IA para bancos top 10 en más de 4 países. Más de 120 millones de llamadas al mes.`,
      ],
      lately: ["Últimamente", "Contratando ingenieros, y regresando un montón de servicios serverless a algo que pocas personas puedan tener en la cabeza :)"],
      off: ["También", "Bicis de ruta. Intentando correr 5 km en menos de 20 minutos. Tablas de Postgres con filas de doce dígitos, que también es trabajo."],
    },
    elsewhere: "En otros lados",
    writing: "Escritos",
    writingDescription: "Ensayos de Kai Takami.",
    minutes: (n) => `${n} min`,
    reads: (n, p) => `${n} ${p === "one" ? "lectura" : "lecturas"}`,
    switchLabel: "Idioma",
    updates: "Notas",
    updatesDescription: "Notas cortas de Kai Takami: dónde ando y en qué ando.",
    latest: "Notas",
    allUpdates: "Todas las notas",
    subscribe: {
      label: "Suscríbete",
      lead: "Nuevos escritos y notas, por correo. No muy seguido.",
      placeholder: "tu@correo.com",
      button: "Suscribirme",
      ok: "Listo, ya estás. Gracias.",
      invalid: "Ese correo no se ve bien.",
      error: "No se pudo guardar. Intenta en un rato.",
      rss: "o RSS",
    },
  },
  pt: {
    name: "Português",
    intl: "pt-BR",
    description: "Kai Takami, CTO na Domu. Sistemas distribuídos, Postgres, bikes de estrada.",
    sceneLabel: "O mar interior de Seto, com a sua hora e o seu clima: uma ponte pênsil até Awaji e uma bike de estrada encostada no muro do cais",
    rows: {
      now: [
        "Agora",
        `CTO na ${domu} (YC S24). Fazemos agentes de voz com IA para bancos top 10 em mais de 4 países. Mais de 120 milhões de ligações por mês.`,
      ],
      lately: ["Ultimamente", "Contratando engenheiros, e transformando um monte de serviços serverless de volta em algo que poucas pessoas consigam manter na cabeça :)"],
      off: ["Também", "Bikes de estrada. Tentando correr 5 km em menos de 20 minutos. Tabelas de Postgres com linhas na casa dos doze dígitos, que também é trabalho."],
    },
    elsewhere: "Em outros lugares",
    writing: "Textos",
    writingDescription: "Ensaios de Kai Takami.",
    minutes: (n) => `${n} min`,
    reads: (n, p) => `${n} ${p === "one" ? "leitura" : "leituras"}`,
    switchLabel: "Idioma",
    updates: "Notas",
    updatesDescription: "Notas curtas de Kai Takami: onde estou e no que ando metido.",
    latest: "Notas",
    allUpdates: "Todas as notas",
    subscribe: {
      label: "Assine",
      lead: "Novos textos e notas, por e-mail. Não com frequência.",
      placeholder: "voce@email.com",
      button: "Assinar",
      ok: "Pronto, você está na lista. Valeu.",
      invalid: "Esse e-mail não parece certo.",
      error: "Não deu para salvar. Tente de novo daqui a pouco.",
      rss: "ou RSS",
    },
  },
  ja: {
    name: "日本語",
    intl: "ja-JP",
    description: "Kai Takami。DomuのCTO。分散システム、Postgres、ロードバイク。",
    sceneLabel: "あなたの時刻と天気に合わせた瀬戸内海。淡路島へ渡る吊り橋と、防波堤に立てかけたロードバイク",
    rows: {
      now: [
        "今",
        `${domu}（YC S24）のCTO。4か国以上のトップ10銀行向けに、AI音声エージェントをつくっている。月に1億2000万件以上の通話。`,
      ],
      lately: ["最近", "エンジニアを採用中。山ほどあるサーバーレスサービスを、数人の頭に入るものへ戻している :)"],
      off: ["ほかに", "ロードバイク。5kmを20分切りで走りたい。行数が12桁のPostgres。これも仕事だけど。"],
    },
    elsewhere: "リンク",
    writing: "書いたもの",
    writingDescription: "Kai Takamiのエッセイ。",
    minutes: (n) => `${n}分`,
    reads: (n) => `${n}人が読了`,
    switchLabel: "言語",
    updates: "メモ",
    updatesDescription: "Kai Takamiの短いメモ。今どこにいて、何をしているか。",
    latest: "メモ",
    allUpdates: "すべてのメモ",
    subscribe: {
      label: "購読",
      lead: "新しい文章とメモをメールで。たまにだけ。",
      placeholder: "you@example.com",
      button: "登録",
      ok: "登録しました。ありがとう。",
      invalid: "メールアドレスを確認してください。",
      error: "保存できませんでした。少し後でもう一度。",
      rss: "RSSもあります",
    },
  },
  ko: {
    name: "한국어",
    intl: "ko-KR",
    description: "Kai Takami. Domu의 CTO. 분산 시스템, Postgres, 로드 바이크.",
    sceneLabel: "지금 당신의 시간과 날씨에 맞춘 세토 내해. 아와지섬으로 이어지는 현수교와 방파제에 기대 세워 둔 로드 바이크",
    rows: {
      now: [
        "지금",
        `${domu}(YC S24)의 CTO. 4개국 이상의 톱10 은행들을 위해 AI 음성 에이전트를 만든다. 한 달에 1억 2천만 통 이상의 통화.`,
      ],
      lately: ["요즘", "엔지니어 채용 중. 잔뜩 늘어난 서버리스 서비스를 몇 사람이 머릿속에 담을 수 있는 걸로 되돌리는 중 :)"],
      off: ["그리고", "로드 바이크. 5km를 20분 안에 뛰고 싶다. 행 수가 12자리인 Postgres. 이것도 일이긴 하다."],
    },
    elsewhere: "링크",
    writing: "글",
    writingDescription: "Kai Takami의 에세이.",
    minutes: (n) => `${n}분`,
    reads: (n) => `${n}명이 읽음`,
    switchLabel: "언어",
    updates: "노트",
    updatesDescription: "Kai Takami의 짧은 메모. 지금 어디서 무엇을 하는지.",
    latest: "노트",
    allUpdates: "전체 노트",
    subscribe: {
      label: "구독",
      lead: "새 글과 노트를 메일로. 자주는 아니고.",
      placeholder: "you@example.com",
      button: "구독하기",
      ok: "등록 완료. 고마워요.",
      invalid: "이메일 주소를 확인해 주세요.",
      error: "저장하지 못했어요. 잠시 후 다시 시도해 주세요.",
      rss: "RSS도 있어요",
    },
  },
};

export const formatReads = (n: number, locale: Locale) => {
  const { intl, reads } = dict[locale];
  return reads(new Intl.NumberFormat(intl).format(n), new Intl.PluralRules(intl).select(n));
};

export const fullDate = (d: Date, locale: Locale) =>
  d.toLocaleDateString(dict[locale].intl, { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
