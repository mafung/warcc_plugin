import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrayList from './PrayerList';
import PrayerRequestModal from './PrayerRequestModal';
import type { PrayerItem } from './types';

const samplePrayers: PrayerItem[] = [
  {
    id: 1,
    category: ["病人醫治", "家庭關係"],
    description: "為我媽媽的手術後康復衷心禱告，求主耶穌以大能醫治她的身體，賜下超自然的恢復力量，讓傷口迅速癒合，體力一天天增加。同時求主充滿她內心以完全的平安，趕走一切擔憂恐懼，用祢寶血保守她的靈魂，使她在這段復原期經歷祢同在的喜樂與安慰。奉主耶穌基督的名，阿們🙏",
    userName: "陳太",
    prayCount: 5,
    date: "2026-02-02",
    images: ["https://images.unsplash.com/photo-1478476868527-002ae3f3e159"],
    status: "approved",
    comments: []
  },
  {
    id: 2,
    category: ["心理支持"],
    description: "主啊，弟弟一路行在治療的征程裡，難免會因身體的苦楚、療程的漫長心生疲憊，也可能在等待與煎熬中，對前路有過迷茫、對信心有過軟弱。求祢親自靠近他，用祢的話語堅固他的心，讓他深知祢的意念高過我們的意念，祢的道路滿有恩典與帶領；縱使腳步疲乏，祢的恩典始終夠他用，縱使眼前看不清，祢的手一直攙扶著他。求主溫柔撫慰他的心靈，擦去他不經意落下的眼淚，賜下出人意外的平安，這份平安超越一切理解，能保守他的心怀意念，讓他不被焦慮、恐懼所轄制，始終有力量仰望祢。願祢在他每一個艱難的時刻，賜下堅定的信心，讓他知道祢與他同在，從未離開；這份信心能成為他面對治療的力量，讓他在病痛中依然能感受祢的愛與安慰。主啊，也求祢看顧弟弟治療的每一個細節，帶領為他醫治的醫護人員，賜下智慧與分辨的能力，讓診療的每一步都滿有祢的預備與祝福，讓藥物與治療的功效如期彰顯，減輕他身體的苦楚。求祢賜給他剛強的身心，能扛過每一次療程的考驗，在身體的恢復中，見證祢的大能與信實。同時也求主堅固我們一家人的心，讓我們能成為弟弟最堅實的陪伴，用溫柔的話語、堅定的鼓勵扶持他，彼此相愛、彼此代求，一同走這段不易的路。願我們全家都能在這段旅程中，更深經歷祢的同在，讓弟弟在家人的愛與主的恩典中，始終有勇氣前行。主啊，我們將弟弟全然交托在祢的手中，深信祢是醫治的神，是安慰的神，是賜下信心與力量的神。願祢親自看顧、保守、帶領，讓弟弟在長期的治療中，心靈被祢堅固，信心被祢建立，最終能在祢的恩典中得著醫治與恢復。",
    userName: "陳太",
    prayCount: 8,
    date: "2026-02-01",
    images: ["https://images.unsplash.com/photo-1438232992991-995b7058bbb3", "https://images.unsplash.com/photo-1441974231531-c6227db76b6e", "https://images.unsplash.com/photo-1522202176988-66273c2fd55f"],
    status: "pending",
    comments: []
  },
  {
    id: 3,
    category: ["家庭關係"],
    description: "孩子住院已一週，求主帶領治療順利，早日出院。",
    userName: "陳太",
    prayCount: 3,
    date: "2026-02-02",
    images: [],
    status: "approved",
    comments: []
  },
  {
    id: 4,
    category: ["病人醫治", "心理支持"],
    description: "為正在進行化療的姊妹禱告，願主賜她平安與勇氣。",
    userName: "周姐妹",
    prayCount: 6,
    date: "2026-02-02",
    images: ["https://images.unsplash.com/photo-1506905925346-21bda4d32df4", "https://images.unsplash.com/photo-1441974231531-c6227db76b6e"],
    status: "approved",
    comments: []
  },
  {
    id: 5,
    category: ["癌症病患"],
    description: "為在病中的弟兄禱告，求主加添信心與盼望。",
    userName: "張弟兄",
    prayCount: 4,
    date: "2026-01-31",
    images: ["https://images.unsplash.com/photo-1521791136064-7986c2920216", "https://images.unsplash.com/photo-1511632765486-a01980e01a18"],
    status: "approved",
    comments: []
  },
  {
    id: 6,
    category: ["病人醫治", "心理支持"],
    description: "為照顧病人的醫護人員禱告，願主賜下身心的平安與力量。",
    userName: "黃醫生",
    prayCount: 2,
    date: "2026-02-02",
    images: [],
    status: "approved",
    comments: []
  },
  {
    id: 7,
    category: ["病人醫治", "長期照護"],
    description: "為長者手術後的康復與家人照顧的力量禱告。",
    userName: "何家",
    prayCount: 7,
    date: "2026-02-02",
    images: [],
    status: "approved",
    comments: []
  }
];

function App() {
  const [prayers, setPrayers] = useState(samplePrayers);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [currentUser] = useState<string>('陳太');

  const incrementPrayCount = (id: number) => {
     setPrayers(prayers.map(item =>
       item.id === id ? { ...item, prayCount: item.prayCount + 1 } : item
     ));
   };

   const updateCommentCount = (prayerId: number, commentCount: number) => {
     setPrayers(prayers.map(item =>
       item.id === prayerId ? { ...item, comments: Array(commentCount).fill({} as any) } : item
     ));
   };

  const openRequestModal = () => {
    setIsRequestModalOpen(true);
  };

  const closeRequestModal = () => {
    setIsRequestModalOpen(false);
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isRequestModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Cleanup
    return () => {
      document.body.style.overflow = '';
    };
  }, [isRequestModalOpen]);

  return (
    /* <Router basename="/warcc"> */
    <Router>
      <Routes>
         <Route path="/" element={<PrayList prayers={prayers} incrementPrayCount={incrementPrayCount} setPrayers={setPrayers} openRequestModal={openRequestModal} currentUser={currentUser} updateCommentCount={updateCommentCount} />} />
        </Routes>
        {isRequestModalOpen && (
          <PrayerRequestModal
            prayers={prayers}
            setPrayers={setPrayers}
            onClose={closeRequestModal}
            currentUser={currentUser}
          />
        )}
    </Router>
  );
}

export default App;
