import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import { Navigation, Pagination } from 'swiper/modules';
import prayIcon from '../src/assets/pray.png';
import logo from '../src/assets/logo.jpg';
import userIcon from '../src/assets/user.svg';
import ShareModal from './ShareModal';
import type { PrayerItem } from './types';

interface PrayListProps {
  prayers: PrayerItem[];
  incrementPrayCount: (id: number) => void;
  setPrayers: (prayers: PrayerItem[]) => void;
  openRequestModal: () => void;
  currentUser: string;
}

function PrayList({ prayers, incrementPrayCount, setPrayers, openRequestModal, currentUser }: PrayListProps) {
   const navigate = useNavigate();
   const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
   const [searchQuery, setSearchQuery] = useState('');
   const [bounceClasses, setBounceClasses] = useState<Record<number, string>>({});
   const [sharePrayer, setSharePrayer] = useState<PrayerItem | null>(null);

  const categories = Array.from(new Set(prayers.flatMap(p => p.category)));
  const filteredPrayers = prayers.filter(p => {
    if (selectedCategory && !p.category.includes(selectedCategory)) {
      return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return p.title.toLowerCase().includes(query) ||
             p.description.toLowerCase().includes(query) ||
             p.userName.toLowerCase().includes(query) ||
             p.date.includes(query);
    }
    return true;
  });

  const getCategoryClasses = (category: string | null, isSelected: boolean) => {
    if (category === null) {
      return isSelected
        ? 'bg-indigo-500 text-white shadow-md'
        : 'bg-gray-200 text-gray-700 hover:bg-gray-300';
    }
    const baseClasses = (() => {
      switch (category) {
        case '病人醫治': return isSelected ? 'bg-pink-500 text-white' : 'bg-pink-100 text-pink-800 hover:bg-pink-200';
        case '心理支持': return isSelected ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-800 hover:bg-purple-200';
        case '兒童病患': return isSelected ? 'bg-green-500 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200';
        case '癌症病患': return isSelected ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-800 hover:bg-blue-200';
        case '家庭關係': return isSelected ? 'bg-red-500 text-white' : 'bg-red-100 text-red-800 hover:bg-red-200';
        case '長期照護': return isSelected ? 'bg-amber-500 text-white' : 'bg-amber-200 text-amber-800 hover:bg-amber-300';
        default: return isSelected ? 'bg-gray-500 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      }
    })();
    return isSelected ? `${baseClasses} shadow-md` : baseClasses;
  };


  return (
    <>
      <style>{`
        .swiper-button-next, .swiper-button-prev {
          width: 20px !important;
          height: 20px !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          margin-top: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        .swiper-button-next::after, .swiper-button-prev::after {
          font-size: 12px !important;
          line-height: 1 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-50 p-6">
        <div className="template-header max-w-6xl mx-auto relative mb-12">
          
          <div className="flex justify-between items-start p-10">
            <div className="mix-blend-multiply absolute inset-0 bg-red-200 bg-opacity-10 flex items-center justify-center text-white text-2xl font-bold">
            template header
          </div>
            <div className="w-30">
              <img src={logo} className="mix-blend-multiply" />
            </div>

            <div className="flex items-center text-gray-500 text-xl">
              關於我們 | 我們的服務 | 支持我們 | 聯絡我們 |  <span className='text-yellow-900 pl-2'>代禱作戰室</span> | 登入  <img src={userIcon} className="w-7" />
            </div>
            
          </div>
          
        </div>

      <div
        className="max-w-6xl mx-auto mb-12"
      >
        <div className="flex items-start mb-12">
          <div className="flex-1"></div>
          <div className="text-right">
            <h2 className="text-4xl font-bold text-indigo-700 mb-4">代禱作戰室</h2>
            <p className="text-xl text-gray-600">同心代禱，祈願醫治</p>
          </div>
          <div className="flex-1"></div>
        </div>

        <div className="flex justify-between mb-8">
        <button
          onClick={() => {
            openRequestModal();
          }}
          className="px-4 py-2 sm:px-4 sm:py-2 text-base font-medium bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 active:bg-indigo-700 transition-all duration-200 shadow-lg"
        >
            + 發出代禱事項 +
          </button>
          <input
            type="text"
            placeholder="搜尋禱告事項..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-2 py-2 sm:px-4 sm:py-2 border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-40 sm:max-w-60"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${getCategoryClasses(null, selectedCategory === null)}`}
          >
            全部
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-8 py-2 rounded-xl font-semibold transition-all duration-200 ${getCategoryClasses(category, selectedCategory === category)}`}
            >
              {category}
            </button>
          ))}
        </div>

        {searchQuery && filteredPrayers.length === 0 && (
          <p className="text-center text-gray-500 mb-8">找不到符合條件的禱告事項</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPrayers.map((prayer) => (
            <div
              key={prayer.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 p-4 border-2 border-gray-100 hover:border-indigo-200 relative"
            >
              {/* Status Ribbon */}
              {prayer.status === 'pending' && (
                <div className="absolute top-0 right-0 z-10">
                  <div className="relative w-32 h-6 bg-gradient-to-r from-amber-400 to-amber-500 
                              text-amber-900 text-xs font-bold flex items-center justify-center shadow-lg 
                              rotate-[45deg] origin-top-left -translate-y-4 translate-x-6 -mr-8">
                管理員審閱中
              </div>
                </div>
              )}
              <div className="mb-4">
                <Swiper
                  modules={[Navigation, Pagination]}
                  spaceBetween={10}
                  slidesPerView={1}
                  navigation={prayer.images.length > 1}
                  pagination={{ clickable: true }}
                  className="w-full aspect-[4/3] rounded-lg"
                >
                  {prayer.images.map((image, index) => (
                    <SwiperSlide key={index}>
                      <img
                        src={image}
                        alt={`${prayer.title} ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg cursor-pointer"
                        onClick={() => navigate(`/prayer/${prayer.id}`)}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
              <div className="mb-3">
                <div className="flex flex-wrap gap-1">
                  {prayer.category.map((cat, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 hover:shadow-md ${
                        cat === '病人醫治' ? 'bg-pink-100 text-pink-800 hover:bg-pink-200' :
                        cat === '心理支持' ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' :
                        cat === '兒童病患' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                        cat === '癌症病患' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                        cat === '家庭關係' ? 'bg-red-100 text-red-800 hover:bg-red-200' :
                        cat === '長期照護' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                        cat === '癌症患者' ? 'bg-teal-100 text-teal-800 hover:bg-teal-200' :
                        'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <h3
                  onClick={() => navigate(`/prayer/${prayer.id}`)}
                  className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  {prayer.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{prayer.description}</p>
                <p className="text-xs text-gray-400 mb-2">{prayer.userName} - {prayer.date}</p>
               
               {/* Share Button for non-pending items and only on user's own posts */}
                 {prayer.status !== 'pending' && prayer.userName === currentUser && (
                   <button
                     onClick={() => setSharePrayer(prayer)}
                     className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors shadow-md text-sm"
                   >
                     <svg
                       className="w-4 h-4"
                       fill="none"
                       stroke="currentColor"
                       viewBox="0 0 24 24"
                     >
                       <path
                         strokeLinecap="round"
                         strokeLinejoin="round"
                         strokeWidth={2}
                         d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                       />
                     </svg>
                     分享
                   </button>
                 )}
               
               <div className="flex justify-end">
                 <div className="flex items-center">
                  <span className="flex items-center gap-2 text-black pr-2">
                   <img src={prayIcon} className={`w-7 h-7 -translate-x-[-5px] transition-transform duration-1000 ${bounceClasses[prayer.id] || ''}`} alt="禱告" />
                   <span className="font-bold text-sm text-gray-500">{prayer.prayCount}</span>
                  </span>
                   <button
                     onClick={() => {
                       incrementPrayCount(prayer.id);
                       setBounceClasses(prev => ({ ...prev, [prayer.id]: 'scale-180' }));
                       setTimeout(() => setBounceClasses(prev => ({ ...prev, [prayer.id]: '' })), 280);
                     }}
                     className="w-20 h-8 p-0 text-sm font-semibold rounded-lg flex items-center justify-center transition-all duration-200 bg-indigo-500 text-white hover:bg-indigo-600 shadow-md"
                     title="Increment pray count"
                   >
                     為您禱告
                   </button>
                   
                 </div>
               </div>
             </div>
          ))}
        </div>
      </div>
      </div>
       <ShareModal
         isOpen={!!sharePrayer}
         onClose={() => setSharePrayer(null)}
         prayerTitle={sharePrayer?.title || ''}
         prayerId={sharePrayer?.id}
       />
     </>
   );
 }

export default PrayList;


