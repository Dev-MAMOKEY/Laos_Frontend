export type Question = {
  title: string
  options: [string, string]
}

export const QUESTIONS: Question[] = [
  {
    title: '여행 일정에서 더 중요한 건 무엇인가요?',
    options: ['많이 보고 많이 경험하기', '무리 없이 여유롭게 쉬기'],
  },
  {
    title: '하루에 선호하는 이동/활동량은?',
    options: ['동선 빡빡해도 괜찮아요', '최소 이동 + 핵심만'],
  },
  {
    title: '여행에서 가장 기대하는 순간은?',
    options: ['로컬 스팟/시장/골목 발견', '숙소/카페/자연에서 회복'],
  },
  {
    title: '일정 스타일을 고른다면?',
    options: ['즉흥으로 바꿀 수 있는 유연한 일정', '미리 확정된 안정적인 일정'],
  },
  {
    title: '동행과의 여행을 상상하면?',
    options: ['함께 여기저기 다니며 추억 만들기', '각자도 쉬면서 합류하는 여행'],
  },
]
