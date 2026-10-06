
'use client';

import { EventPopup } from '@/components/event-popup';

/**
 * @fileOverview 전문가 요청에 따른 이벤트 전용 확인 페이지
 * /event 경로로 접속 시 팝업 형태가 아닌 전체 페이지로 이벤트 내용을 확인합니다.
 */
export default function StandaloneEventPage() {
  return (
    <div className="min-h-screen bg-[#06051b]">
      <EventPopup isStandalone={true} />
    </div>
  );
}
