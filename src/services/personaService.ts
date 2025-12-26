export type Destination = {
  id: string
  name: string
  description: string
}

export type ItineraryItem = {
  id: string
  title: string
  description: string
}

export type ItineraryDay = {
  day: number
  title: string
  items: ItineraryItem[]
}

export type Persona = {
  keyword: string
  tags: string[]
  description: string
  destinations: Destination[]
  itinerary: ItineraryDay[]
}

function makeItemId(prefix: string, idx: number) {
  return `${prefix}_${idx}`
}

function analyzePersonaLocal(answers: number[]): Persona {
  const aCount = answers.filter((v) => v === 0).length
  const bCount = answers.filter((v) => v === 1).length

  if (aCount >= bCount) {
    return {
      keyword: '일정 확장형 탐험가',
      tags: ['경험 중심', '발견', '동선 최적화', '유연함'],
      description:
        '보고 싶은 게 많고 움직임을 즐겨요. 일정은 유연하게 가져가되, 밀도 있게 채우는 편이 만족도가 높습니다.',
      destinations: [
        {
          id: 'tokyo',
          name: '도쿄',
          description: '스팟 밀도가 높아 하루를 촘촘하게 써도 재미가 이어져요.',
        },
        {
          id: 'hongkong',
          name: '홍콩',
          description: '짧은 시간에 다양한 경험을 압축해서 즐기기 좋아요.',
        },
        {
          id: 'taipei',
          name: '타이베이',
          description: '야시장·온천·카페 등 선택지가 많아 즉흥 일정에 강합니다.',
        },
      ],
      itinerary: [
        {
          day: 1,
          title: '도착 & 도심 워밍업',
          items: [
            {
              id: makeItemId('exp_d1', 1),
              title: '도착 후 동네 산책',
              description: '숙소 주변 골목을 가볍게 훑으며 분위기를 잡아요.',
            },
            {
              id: makeItemId('exp_d1', 2),
              title: '로컬 시장/상점 탐방',
              description: '현지 간식이나 소품을 보며 즉흥 루트를 만들어봐요.',
            },
            {
              id: makeItemId('exp_d1', 3),
              title: '야경 스팟',
              description: '이동 동선을 최소화하면서도 임팩트 있는 마무리.',
            },
          ],
        },
        {
          day: 2,
          title: '경험 밀도 높이기',
          items: [
            {
              id: makeItemId('exp_d2', 1),
              title: '핫플/전시/편집숍 코스',
              description: '관심사 기준으로 스팟을 연달아 찍어요.',
            },
            {
              id: makeItemId('exp_d2', 2),
              title: '카페 1곳 + 휴식',
              description: '중간에 한 번 쉬어야 다음 코스도 즐겨요.',
            },
            {
              id: makeItemId('exp_d2', 3),
              title: '로컬 맛집',
              description: '검색보다 현장 추천/줄 서는 곳을 우선해보세요.',
            },
          ],
        },
        {
          day: 3,
          title: '즉흥 버퍼 데이',
          items: [
            {
              id: makeItemId('exp_d3', 1),
              title: '전날 저장해둔 스팟 재방문',
              description: '마음에 든 동네를 한 번 더 깊게 즐겨요.',
            },
            {
              id: makeItemId('exp_d3', 2),
              title: '기념품/마무리 쇼핑',
              description: '동선 끝자락에서 한 번에 정리합니다.',
            },
          ],
        },
      ],
    }
  }

  return {
    keyword: '일정 안정형 힐러',
    tags: ['회복', '여유', '컨디션', '안정감'],
    description:
      '여행에서 가장 중요한 건 컨디션! 무리한 이동보다 머무는 시간을 확보할수록 만족도가 커집니다.',
    destinations: [
      {
        id: 'jeju',
        name: '제주(휴식 동선)',
        description: '드라이브/산책/카페를 연결하며 쉬는 일정에 딱 맞아요.',
      },
      {
        id: 'okinawa',
        name: '오키나와',
        description: '바다 중심의 휴양 리듬으로 회복에 집중할 수 있어요.',
      },
      {
        id: 'chiangmai',
        name: '치앙마이',
        description: '느린 도시 리듬과 카페/마사지로 여유를 만들기 좋습니다.',
      },
    ],
    itinerary: [
      {
        day: 1,
        title: '도착 & 컨디션 회복',
        items: [
          {
            id: makeItemId('heal_d1', 1),
            title: '체크인 후 휴식',
            description: '무리하지 않고 몸 컨디션을 먼저 올려요.',
          },
          {
            id: makeItemId('heal_d1', 2),
            title: '근처 카페/산책 1곳',
            description: '가볍게 바람 쐬며 리듬을 맞춥니다.',
          },
        ],
      },
      {
        day: 2,
        title: '느린 동선으로 채우기',
        items: [
          {
            id: makeItemId('heal_d2', 1),
            title: '자연 스팟(바다/숲) 1곳',
            description: '머무는 시간을 길게 잡는 게 핵심이에요.',
          },
          {
            id: makeItemId('heal_d2', 2),
            title: '스파/마사지',
            description: '여행 만족도를 끌어올리는 확실한 선택.',
          },
          {
            id: makeItemId('heal_d2', 3),
            title: '노을/야경은 숙소 근처에서',
            description: '이동을 줄이고 감성을 챙겨요.',
          },
        ],
      },
      {
        day: 3,
        title: '여유 있게 마무리',
        items: [
          {
            id: makeItemId('heal_d3', 1),
            title: '브런치 & 체크아웃',
            description: '서두르지 않는 마무리로 피로를 남기지 않아요.',
          },
          {
            id: makeItemId('heal_d3', 2),
            title: '기념품은 1곳에서',
            description: '간결하게 정리하면 마지막까지 편해요.',
          },
        ],
      },
    ],
  }
}

async function analyzePersonaViaApi(answers: number[]): Promise<Persona> {
  const apiUrl = import.meta.env.VITE_PERSONA_API_URL as string | undefined
  if (!apiUrl) {
    return analyzePersonaLocal(answers)
  }

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  })

  if (!res.ok) {
    return analyzePersonaLocal(answers)
  }

  const data = (await res.json()) as Persona
  return data
}

export async function analyzePersonaAsync(answers: number[]): Promise<Persona> {
  const result = await analyzePersonaViaApi(answers)
  return result
}
