export interface FilterResult {
  blocked: boolean;
  reason?: "location" | "name" | "contact";
}

// 한글 성씨 (상위 빈도)
const KOREAN_SURNAMES = [
  "김","이","박","최","정","강","조","윤","장","임","한","오","서","신","권","황",
  "안","송","류","유","전","홍","고","문","양","손","배","백","허","노","남","심",
  "하","주","구","곽","성","차","우","민","진","나","변","방","원","석","선","설",
];

// 위치/좌표 패턴
const LOCATION_PATTERNS = [
  /[NS]\s*\d{1,3}[.\d]*/i,
  /[EW]\s*\d{1,3}[.\d]*/i,
  /[북남]\s*위\s*\d/,
  /[동서]\s*경\s*\d/,
  /\d{1,3}[°도]\s*\d{1,2}[′'분]/,
  /현재\s*위치/,
  /current\s*position/i,
  /current\s*location/i,
  /괌\s*근처/,
  /하와이\s*근처/,
  /해역\s*(에서|근처|부근|인근)/,
  /포착|목격|발견.*위치/,
];

// 전화번호 패턴
const PHONE_PATTERNS = [
  /01[016789]-?\d{3,4}-?\d{4}/,
  /\d{2,3}-\d{3,4}-\d{4}/,
];

// 이메일 패턴
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

// 한글 실명 패턴: 성 + 이름 1~2자 (단어 시작 기반)
function hasKoreanName(text: string): boolean {
  const EXCEPTIONS = [
    // 일반 명사/단어
    "대한","민국","해군","잠수","무사","귀환","응원","파이팅","화이팅",
    "최고","최선","최강","최근","최초","최대","최소","최후","최적",
    "정말","정확","정상","정도","정보","정신","정부","정식",
    "강한","강력","강화","강조","강대","강풍",
    "안전","안녕","안심","안정","안내","안창","안창호",
    "한국","한번","한편","한때","한동","한가운","한마디","한반도",
    "이것","이런","이상","이후","이전","이번","이미","이제",
    "장하","장기","장점","장비","장소","장래",
    "배치","배경","배려","배달",
    "성공","성과","성장","성원","성실",
    "전투","전쟁","전력","전체","전국","전진",
    "고맙","고마워","고생","고귀",
    "서로","서울","서해",
    "남쪽","남해","남북",
    "북쪽","북한",
    "문제","문화",
    "주변","주의",
    "구조","구축",
    "선배","선원","선장",
    "원래","원하",
  ];

  for (const surname of KOREAN_SURNAMES) {
    // 성씨 앞에 한글이 없어야 함 → 복합어 내부 매칭 방지
    const pattern = new RegExp(`(?<![가-힣])${surname}[가-힣]{1,2}`, "g");
    let m;
    while ((m = pattern.exec(text)) !== null) {
      const match = m[0];
      if (match.length >= 2 && match.length <= 4 && !EXCEPTIONS.includes(match)) {
        return true;
      }
    }
  }
  return false;
}

export function filterContent(text: string): FilterResult {
  // 1. 위치/좌표 검사
  for (const pattern of LOCATION_PATTERNS) {
    if (pattern.test(text)) {
      return { blocked: true, reason: "location" };
    }
  }

  // 2. 연락처 검사
  for (const pattern of PHONE_PATTERNS) {
    if (pattern.test(text)) {
      return { blocked: true, reason: "contact" };
    }
  }
  if (EMAIL_PATTERN.test(text)) {
    return { blocked: true, reason: "contact" };
  }

  // 3. 실명 검사 (한글 + 영문)
  if (hasKoreanName(text) || hasEnglishName(text)) {
    return { blocked: true, reason: "name" };
  }

  return { blocked: false };
}

// 영문 이름 사전 (상위 빈도)
const ENGLISH_NAMES = [
  "james","john","robert","michael","david","william","richard","joseph","thomas","charles",
  "christopher","daniel","matthew","anthony","mark","donald","steven","paul","andrew","joshua",
  "kenneth","kevin","brian","george","timothy","ronald","edward","jason","jeffrey","ryan",
  "jacob","gary","nicholas","eric","jonathan","stephen","larry","justin","scott","brandon",
  "benjamin","samuel","raymond","gregory","frank","alexander","patrick","jack","dennis","jerry",
  "mary","patricia","jennifer","linda","barbara","elizabeth","susan","jessica","sarah","karen",
  "lisa","nancy","betty","margaret","sandra","ashley","dorothy","kimberly","emily","donna",
];

function hasEnglishName(text: string): boolean {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);
  return words.some((w) => ENGLISH_NAMES.includes(w));
}
