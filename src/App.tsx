import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrayList from './PrayerList';
import PrayerDetail from './PrayerDetail';

interface PrayerItem {
  id: number;
  title: string;
  category: string[];
  description: string;
  userName: string;
  prayCount: number;
  date: string;
  images: string[];
}

const samplePrayers: PrayerItem[] = [
  {
    id: 1,
    title: "媽媽手術康復",
    category: ["病人醫治", "家庭關係"],
    description: "為媽媽手術後的恢復禱告，求主賜下力量與平安。",
    userName: "陳太",
    prayCount: 5,
    date: "2026-02-02",
    images: ["https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop"]
  },
  {
    id: 2,
    title: "弟弟慢性病治療",
    category: ["心理支持"],
    description: "為弟弟長期的治療過程禱告，求主堅固他的信心與心靈。",
    userName: "林先生",
    prayCount: 8,
    date: "2026-02-01",
    images: ["https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=400&h=300&fit=crop", "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop", "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop"]
  },
  {
    id: 3,
    title: "孩子康復進展",
    category: ["家庭關係"],
    description: "孩子住院已一週，求主帶領治療順利，早日出院。",
    userName: "李太",
    prayCount: 3,
    date: "2026-02-02",
    images: ["https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop", "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop"]
  },
  {
    id: 4,
    title: "癌症病友堅強面對治療",
    category: ["病人醫治", "心理支持"],
    description: "為正在進行化療的姊妹禱告，願主賜她平安與勇氣。",
    userName: "周姐妹",
    prayCount: 6,
    date: "2026-02-02",
    images: ["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop", "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop"]
  },
  {
    id: 5,
    title: "病中信心堅固",
    category: ["癌症病患"],
    description: "為在病中的弟兄禱告，求主加添信心與盼望。",
    userName: "張弟兄",
    prayCount: 4,
    date: "2026-01-31",
    images: ["https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=300&fit=crop", "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=300&fit=crop"]
  },
  {
    id: 6,
    title: "醫護人員力量更新",
    category: ["病人醫治", "心理支持"],
    description: "為照顧病人的醫護人員禱告，願主賜下身心的平安與力量。",
    userName: "黃醫生",
    prayCount: 2,
    date: "2026-02-02",
    images: ["https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop", "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=300&fit=crop"]
  },
  {
    id: 7,
    title: "長者康復與照顧",
    category: ["病人醫治", "長期照護"],
    description: "為長者手術後的康復與家人照顧的力量禱告。",
    userName: "何家",
    prayCount: 7,
    date: "2026-02-02",
    images: ["https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop", "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop"]
  }
];

function App() {
  const [prayers, setPrayers] = useState(samplePrayers);

  const incrementPrayCount = (id: number) => {
    setPrayers(prayers.map(item =>
      item.id === id ? { ...item, prayCount: item.prayCount + 1 } : item
    ));
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<PrayList prayers={prayers} incrementPrayCount={incrementPrayCount} />} />
        <Route path="/prayer/:id" element={<PrayerDetail prayers={prayers} incrementPrayCount={incrementPrayCount} />} />
      </Routes>
    </Router>
  );
}

export default App;
