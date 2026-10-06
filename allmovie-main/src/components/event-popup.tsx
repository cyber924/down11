
'use client';

import { useState, useEffect } from 'react';

/**
 * @fileOverview 전문가 제공 HTML 기반의 전면 광고 이벤트 팝업 컴포넌트 (수정 완료 버전)
 * - 레이아웃 중첩(Overlap) 문제 해결: aspect-ratio 및 min-height 적용
 * - 하이드레이션 오류 방지: 클라이언트 마운트 체크 도입
 * - 에셋 최적화: Picsum 대신 Unsplash 고화질 에셋 사용
 */
export function EventPopup({ isStandalone = false }: { isStandalone?: boolean }) {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 컴포넌트 마운트 시 노출 시도
    setShow(true);
    
    if (!isStandalone) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isStandalone]);

  const handleAction = () => {
    window.open('https://filetori.com/?site=MKT1', '_blank');
    if (!isStandalone) {
      handleClose();
    }
  };

  const handleClose = () => {
    setShow(false);
    document.body.style.overflow = 'unset';
  };

  // 하이드레이션 미스매치 방지
  if (!mounted) return null;
  if (!show && !isStandalone) return null;

  return (
    <div className={`${isStandalone ? 'relative min-h-screen' : 'fixed inset-0 z-[9999]'} bg-[#06051b] overflow-y-auto animate-in fade-in duration-500`}>
      <div className="min-h-full w-full flex flex-col items-center">
        
        {!isStandalone && (
          <div className="w-full max-w-[980px] flex justify-end px-6 py-6 shrink-0">
            <button 
              onClick={handleClose}
              className="text-white/40 hover:text-white text-[11px] font-bold uppercase tracking-widest border border-white/10 px-4 py-1.5 rounded-full transition-colors bg-white/5 backdrop-blur-md"
            >
              SKIP TO NEWS ✕
            </button>
          </div>
        )}

        <style dangerouslySetInnerHTML={{ __html: `
          :root{
            --bg:#06051b;
            --cyan:#55ecff;
            --yellow:#ffd92f;
            --muted:#d7d2ee;
          }
          .event-page {
            width:min(100%, 980px);
            margin:0 auto;
            overflow:hidden;
            background:
              radial-gradient(circle at 50% 14%,rgba(125,55,255,.22),transparent 24%),
              radial-gradient(circle at 10% 36%,rgba(0,194,255,.12),transparent 25%),
              radial-gradient(circle at 90% 36%,rgba(255,30,196,.12),transparent 25%),
              linear-gradient(180deg,#07051d 0%,#0b0727 72%,#08061d 100%);
            box-shadow:0 0 40px rgba(0,0,0,.16);
            position: relative;
            color: #fff;
            cursor: default;
            padding-bottom: 100px; 
          }
          .hero{ padding:40px 34px 10px; text-align:center; position: relative; z-index: 10; }
          .eyebrow{
            display:inline-flex; align-items:center; gap:10px;
            border:1px solid #a650ff; border-radius:999px;
            padding:10px 24px; box-shadow:0 0 20px rgba(165,64,255,.30), inset 0 0 16px rgba(105,60,255,.12);
            font-weight:800; font-size:18px;
          }
          .eyebrow .gift{font-size:24px}
          .hero h1{
            margin:24px auto 14px; max-width:860px;
            font-size:clamp(24px,4.4vw,42px); line-height:1.32;
            letter-spacing:-.05em; word-break:keep-all;
            color: #fff;
          }
          .hero h1 .cyan{color:var(--cyan)}
          .hero h1 .yellow{color:var(--yellow)}
          .hero p{ margin:0 auto; color:var(--muted); font-size:clamp(15px,2vw,19px); line-height:1.7; }
          
          /* 이미지 로딩 전 레이아웃 붕괴 방지 */
          .visual-wrap{ padding:22px 28px 0; position:relative; cursor: pointer; min-height: 400px; }
          .visual-card{
            position:relative; border-radius:34px; padding:10px;
            background:linear-gradient(135deg,rgba(74,213,255,.72),rgba(173,68,255,.76),rgba(255,48,188,.70));
            box-shadow:0 20px 60px rgba(0,0,0,.30),0 0 24px rgba(123,61,255,.20);
            aspect-ratio: 16 / 9;
            overflow: hidden;
          }
          .visual-card img{ display:block; width:100%; height:100%; object-fit: cover; border-radius:27px; }
          
          .center-label{
            position:absolute; left:50%; top:50%; transform:translate(-50%,-50%);
            width:40%; min-width:200px; text-align:center; pointer-events:none; z-index: 5;
          }
          .center-label small{
            display:inline-block; background:linear-gradient(90deg,#bc43ff,#ff43bc);
            padding:5px 16px; border-radius:999px; font-size:15px; font-weight:900; margin-bottom:8px;
          }
          .center-label strong{
            display:block; font-size:clamp(22px,4vw,44px); line-height:1.04;
            letter-spacing:-.06em; text-shadow:0 4px 12px #000,0 0 12px rgba(103,227,255,.35);
          }
          .category{
            position:absolute; padding:8px 18px; border-radius:999px;
            font-weight:950; font-size:clamp(14px,2.1vw,20px);
            box-shadow:0 8px 22px rgba(0,0,0,.30); line-height:1.1; z-index: 6;
          }
          .movie{left:10%;top:20%;background:linear-gradient(90deg,#0bb2ff,#693cff)}
          .drama{right:10%;top:20%;background:linear-gradient(90deg,#bb2cff,#ff388c)}
          .video{left:10%;bottom:12%;background:linear-gradient(90deg,#00bfa5,#00a8ff)}
          .more{right:10%;bottom:12%;background:linear-gradient(90deg,#ff9b16,#ff4e78)}
          
          .cta-section{ padding:26px 24px 28px; text-align:center; }
          .cta-row{ display:flex; justify-content:center; align-items:center; gap:22px; }
          .click{ color:#42e7ff; font-size:18px; font-weight:900; }
          .cta-btn{
            display:inline-flex; align-items:center; justify-content:center;
            gap:12px; min-width:min(500px,68vw); padding:18px 30px;
            border-radius:999px; color:#fff !important; text-decoration:none !important;
            font-weight:950; font-size:clamp(22px,3.7vw,34px);
            background:linear-gradient(90deg,#ff288d,#ea38cf,#ff8b35);
            border:2px solid rgba(255,255,255,.55);
            box-shadow:0 0 24px rgba(255,45,180,.62),inset 0 5px 12px rgba(255,255,255,.20);
            cursor: pointer; transition: transform 0.2s;
          }
          .cta-btn span{
            display:grid; place-items:center; width:40px; height:40px;
            border-radius:50%; background:#fff; color:#f2389b; font-size:30px; line-height:1;
          }
          .cta-btn:hover{transform:translateY(-2px);filter:brightness(1.05)}
          .coupon-section{ padding:0 38px 32px; }
          .coupon{
            position:relative; overflow:hidden; border-radius:28px; padding:38px 34px;
            border:2px solid #ff73d6;
            background:
              radial-gradient(circle at 80% 20%,rgba(255,84,34,.25),transparent 24%),
              linear-gradient(135deg,#3d0922,#6a1716 48%,#310922);
            box-shadow:0 0 28px rgba(255,48,190,.22);
          }
          .coupon:before{
            content:"COUPON"; position:absolute; left:-48px; top:26px;
            transform:rotate(-45deg); width:190px; padding:9px 0;
            background:linear-gradient(90deg,#ff284d,#ff8a2e); text-align:center; font-weight:950; font-size:19px;
          }
          .coupon-top{ text-align:center; color:#eee5f3; font-size:18px; font-weight:700; }
          .coupon h2{ text-align:center; margin:8px 0 24px; font-size:clamp(26px,3.8vw,42px); letter-spacing:-.05em; color: #fff; }
          .coupon h2 em{font-style:normal;color:var(--yellow)}
          .ticket-row{ display:flex; align-items:center; justify-content:center; gap:18px; }
          .ticket{
            min-width:260px; padding:20px 28px; background:#fff8f4; color:#d62a5b;
            border:2px dashed #e8c5c5; border-radius:12px; text-align:center;
            font-size:clamp(26px,4vw,40px); font-weight:950;
          }
          .plus{
            width:52px; height:52px; border-radius:50%; display:grid;
            place-items:center; background:#8d1455; border:2px solid #ff80d1;
            font-size:32px; font-weight:900;
          }
          .benefits{ background:#fff; color:#261758; padding:34px 28px; display:grid; grid-template-columns:repeat(4,1fr); gap:0; }
          .benefit{ text-align:center; padding:6px 18px; border-right:1px solid #ddd8ee; }
          .benefit:last-child{border-right:0}
          .icon-circle{
            width:72px; height:72px; margin:0 auto 14px; border-radius:50%;
            display:grid; place-items:center; color:#fff; font-size:32px;
            background:linear-gradient(145deg,#5432d6,#9328e8);
            box-shadow:0 8px 20px rgba(94,41,210,.28);
          }
          .benefit strong{ display:block; font-size:19px; margin-bottom:7px; }
          .benefit span{ font-size:14px; line-height:1.55; color:#544b6d; }
          .notice{ padding:24px 38px 40px; color:#c9c5dc; font-size:13px; line-height:1.85; text-align: left; }
          .notice strong{ color:#fff; display:block; margin-bottom:4px; font-size:15px; }
          .notice ul{ padding-left:19px; margin:0; }

          @media(max-width:700px){
            .hero{padding:30px 20px 10px}
            .eyebrow{font-size:14px;padding:8px 18px}
            .hero h1{font-size:clamp(22px,6.5vw,32px);margin-top:16px}
            .hero p{font-size:15px}
            .visual-wrap{padding:15px 15px 0; min-height: 250px;}
            .center-label{min-width:140px; top:50%}
            .category{font-size:12px;padding:6px 12px}
            .cta-btn{min-width:90%; font-size:24px; padding:15px 20px}
            .cta-btn span{width:34px; height:34px; font-size:24px}
            .click{display:none}
            .coupon-section{padding:0 15px 25px}
            .coupon{padding:30px 20px}
            .coupon h2{font-size:28px}
            .ticket{min-width:0; flex:1; font-size:26px; padding:15px 10px}
            .plus{width:40px; height:40px; font-size:24px}
            .benefits{ grid-template-columns: 1fr 1fr; gap: 25px 0; padding:25px 10px; }
            .benefit{ border-right: 0; padding:5px }
            .icon-circle{width:60px; height:60px; font-size:26px}
            .event-page { padding-bottom: 120px; }
          }
        `}} />

        <main className="event-page" onClick={(e) => e.stopPropagation()}>
          <section className="hero">
            <div className="eyebrow"><span className="gift">🎁</span> 최신영화, 드라마, 동영상 <b style={{color:'#ffe234'}}>무료 이용 이벤트</b></div>
            <h1>
              파일토리에서 <span className="cyan">최신영화, 드라마, 동영상</span>을<br/>
              무료로 이용할 수 있는<br/>
              <span className="yellow">무료다운로드 이용권</span>을 제공합니다!
            </h1>
            <p>다양한 콘텐츠를 한 번에 즐기고, 특별한 무료 이용 혜택까지 받아보세요.</p>
          </section>

          <section className="visual-wrap" onClick={handleAction}>
            <div className="visual-card">
              <img 
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80" 
                alt="이벤트 고해상도 비주얼" 
                data-ai-hint="night sea"
              />
              <div className="category movie">영화 · FREE</div>
              <div className="category drama">드라마 · FREE</div>
              <div className="category video">동영상 · FREE</div>
              <div className="category more">다양한 콘텐츠</div>
              <div className="center-label">
                <small>SPECIAL GIFT</small>
                <strong>무료 이용권<br/>즉시 지급</strong>
              </div>
            </div>
          </section>

          <section className="cta-section">
            <div className="cta-row">
              <span className="click">CLICK 》</span>
              <button onClick={handleAction} className="cta-btn">무료 이용권 받기 <span>›</span></button>
              <span className="click">《 CLICK</span>
            </div>
          </section>

          <section className="coupon-section">
            <div className="coupon">
              <div className="coupon-top">최신영화, 드라마, 예능 등 <b style={{color:'#ffe234'}}>무료로 이용 가능</b></div>
              <h2>파일토리 <em>무료다운로드 이용권</em></h2>
              <div className="ticket-row">
                <div className="ticket">100,000P</div>
                <div className="plus">+</div>
                <div className="ticket">쿠폰 10장</div>
              </div>
            </div>
          </section>

          <section className="benefits">
            <div className="benefit"><div className="icon-circle">✓</div><strong>안전한 이용</strong><span>안심하고 편리하게<br/>이용하세요!</span></div>
            <div className="benefit"><div className="icon-circle">⇩</div><strong>빠른 다운로드</strong><span>다양한 콘텐츠를<br/>빠르고 편하게!</span></div>
            <div className="benefit"><div className="icon-circle">%</div><strong>파격 혜택</strong><span>무료다운로드와<br/>쿠폰 혜택!</span></div>
            <div className="benefit"><div className="icon-circle">☎</div><strong>친절한 고객센터</strong><span>문의사항을 빠르게<br/>도와드립니다.</span></div>
          </section>

          <section className="notice">
            <strong>유의사항</strong>
            <ul>
              <li>이벤트 이용 조건과 지급 방식은 실제 운영 정책에 맞게 적용해 주세요.</li>
              <li>이용권 및 쿠폰의 사용 기간과 적용 콘텐츠는 서비스 정책에 따라 달라질 수 있습니다.</li>
              <li>버튼 링크는 실제 이벤트 신청 주소로 교체해 사용하세요.</li>
            </ul>
          </section>
        </main>

        <div className="h-24 w-full shrink-0" />
      </div>
    </div>
  );
}
