import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import prayIcon from '../src/assets/pray.png';
import logo from '../src/assets/logo.jpg';
import userIcon from '../src/assets/user.svg';
import ShareModal from './ShareModal';
import CommentModal from './CommentModal';
import type { PrayerItem } from './types';

// Helper function to handle both click and touch events
const handleTouch = (callback: (e?: React.MouseEvent | React.TouchEvent) => void) => (e: React.MouseEvent | React.TouchEvent) => {
  e.preventDefault();
  e.stopPropagation();
  callback(e);
};

interface PrayListProps {
  prayers: PrayerItem[];
  incrementPrayCount: (id: number) => void;
  setPrayers: (prayers: PrayerItem[]) => void;
  openRequestModal: () => void;
  currentUser: string;
  updateCommentCount: (prayerId: number, commentCount: number) => void;
}

function PrayList({ prayers, incrementPrayCount, openRequestModal, currentUser, updateCommentCount }: PrayListProps) {
   const navigate = useNavigate();
   const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
   const [searchQuery, setSearchQuery] = useState('');
   const [showMyPrayers, setShowMyPrayers] = useState(false);
   const [bounceClasses, setBounceClasses] = useState<Record<number, string>>({});
   const [sharePrayer, setSharePrayer] = useState<PrayerItem | null>(null);
   const [commentPrayer, setCommentPrayer] = useState<PrayerItem | null>(null);
   const [lightboxImage, setLightboxImage] = useState<string | null>(null);
   const [lightboxIndex, setLightboxIndex] = useState<number>(0);
   const [expandedDescriptions, setExpandedDescriptions] = useState<Record<number, boolean>>({});
   const currentPrayerRef = useRef<PrayerItem | null>(null);

   // Lock body scroll when any modal is open
   useEffect(() => {
     if (lightboxImage || sharePrayer || commentPrayer) {
       document.body.style.overflow = 'hidden';
     } else {
       document.body.style.overflow = '';
     }
     return () => {
       document.body.style.overflow = '';
     };
   }, [lightboxImage, sharePrayer, commentPrayer]);

  const categories = Array.from(new Set(prayers.flatMap(p => p.category)));
  const filteredPrayers = prayers.filter(p => {
    if (showMyPrayers && p.userName !== currentUser) {
      return false;
    }
    if (selectedCategory && !p.category.includes(selectedCategory)) {
      return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return p.description.toLowerCase().includes(query) ||
             p.userName.toLowerCase().includes(query) ||
             p.date.includes(query);
    }
    return true;
  });

  const getCategoryClasses = (category: string | null, isSelected: boolean) => {
    if (category === null) {
      return isSelected
        ? 'bg-sky-600 text-sky-100 shadow-md'
        : 'bg-sky-200 text-sky-700 hover:bg-sky-300';
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
      <div className={`min-h-screen bg-gradient-to-br from-stone-50 to-stone-50 p-6 ${lightboxImage ? 'overflow-hidden' : ''}`}>
        <div className="template-header max-w-7xl mx-auto relative mb-12">
          
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

      <div className="max-w-7xl mx-auto mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-4 mb-4">
              <h3 className="text-lg font-bold text-gray-800 mb-3">Sidebar left</h3>
              <div className="bg-gray-200 rounded-lg h-40 flex items-center justify-center text-gray-500">
                左側位
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-3">代禱資源</h3>
              <ul className="space-y-2">
                <li className="text-sm text-gray-600 hover:text-indigo-600 cursor-pointer">禱告指引</li>
                <li className="text-sm text-gray-600 hover:text-indigo-600 cursor-pointer">代禱小組</li>
                <li className="text-sm text-gray-600 hover:text-indigo-600 cursor-pointer">屬靈資源</li>
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
        <div className="flex items-start mb-12">
          <div className="flex-1"></div>
          <div className="text-right">
            <h2 className="text-4xl font-bold text-indigo-700 mb-4">代禱作戰室</h2>
            <p className="text-xl text-gray-600">同心代禱，祈願醫治</p>
          </div>
          <div className="flex-1"></div>
        </div>

        <div className="flex justify-between mb-8">
        <div className="flex gap-2">
        <button
          onClick={handleTouch(() => {
            openRequestModal();
          })}
          className="px-4 py-2 sm:px-4 sm:py-2 text-base font-medium bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 active:bg-indigo-700 transition-all duration-200 shadow-lg active:scale-95"
        >
            + 發出代禱事項 +
          </button>
          <button
            onClick={handleTouch(() => setShowMyPrayers(!showMyPrayers))}
            className={`px-4 py-2 sm:px-4 sm:py-2 text-base font-medium rounded-xl transition-all duration-200 shadow-lg active:scale-95 ${
              showMyPrayers
                ? 'bg-green-800 text-white shadow-md'
                : 'bg-green-200 text-green-800 hover:bg-gray-300'
            }`}
          >
            我的
          </button>
        </div>
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
            onClick={handleTouch(() => setSelectedCategory(null))}
            className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${getCategoryClasses(null, selectedCategory === null)} active:scale-95`}
          >
            全部
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={handleTouch(() => setSelectedCategory(category))}
              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${getCategoryClasses(category, selectedCategory === category)} active:scale-95`}
            >
              {category}
            </button>
          ))}
        </div>

        {searchQuery && filteredPrayers.length === 0 && (
          <p className="text-center text-gray-500 mb-8">找不到符合條件的禱告事項</p>
        )}
        <div className="space-y-6">
          {filteredPrayers.map((prayer) => (
            <div
              key={prayer.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 p-4 border-2 border-gray-100  relative"
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
                <div className="flex items-center justify-between">
                  <h3
                    className="font-bold text-2xl text-gray-900 mb-2 line-clamp-2 transition-colors flex-1"
                  >
                    {prayer.userName}
                  </h3>
                  {/* Right: Share Button */}
                  {prayer.status !== 'pending' && prayer.userName === currentUser && (
                    <button
                      onClick={handleTouch(() => setSharePrayer(prayer))}
                      className="w-20 h-8 p-0 text-sm font-semibold rounded-lg flex items-center justify-center transition-all duration-200 bg-purple-500 text-white hover:bg-purple-600 shadow-md active:scale-95 ml-4"
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
                </div>
                <div>
                  <p
                    className={`mt-3 text-sm text-gray-600 mb-3 ${expandedDescriptions[prayer.id] ? '' : 'line-clamp-2'}`}
                  >
                    {prayer.description}
                  </p>
                  {!expandedDescriptions[prayer.id] && prayer.description.length > 100 && (
                    <button
                      onClick={handleTouch(() => setExpandedDescriptions(prev => ({ ...prev, [prayer.id]: true })))}
                      className="text-indigo-600 text-sm font-semibold hover:text-indigo-800 transition-colors mb-3 active:scale-95"
                    >
                      查看更多
                    </button>
                  )}
                </div>
                
                {/* Images section - moved under description */}
                <div className="mb-3">
                  {prayer.images.length > 0 && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1">
                      {prayer.images.map((image, index) => (
                        <div
                          key={index}
                          className="relative aspect-square cursor-pointer group active:scale-95"
                          onClick={handleTouch(() => {
                            currentPrayerRef.current = prayer;
                            setLightboxImage(image);
                            setLightboxIndex(index);
                          })}
                        >
                          <img
                            src={image}
                            alt={`${prayer.userName} ${index + 1}`}
                            className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <p className="text-xs text-gray-400 mb-2">{prayer.date}</p>
                
                {/* Action Buttons */}
                <div className="flex items-center justify-between mt-4">
                  {/* Left: Comment Button */}
                  <button
                    onClick={handleTouch(() => setCommentPrayer(prayer))}
                    className="w-25 h-8 p-0 text-sm font-semibold rounded-lg flex items-center justify-center transition-all duration-200 bg-blue-500 text-white hover:bg-blue-600 shadow-md active:scale-95"
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    {prayer.comments?.length || 0} 代禱留言
                  </button>
                  
                  {/* Right: Prayer Button */}
                  <div className="flex items-center">
                    <span className="flex items-center gap-2 text-black pr-2">
                      <img src={prayIcon} className={`w-7 h-7 -translate-x-[-5px] transition-transform duration-1000 ${bounceClasses[prayer.id] || ''}`} alt="禱告" />
                      <span className="font-bold text-sm text-gray-500">{prayer.prayCount}</span>
                    </span>
                    <button
                      onClick={handleTouch(() => {
                        incrementPrayCount(prayer.id);
                        setBounceClasses(prev => ({ ...prev, [prayer.id]: 'scale-180' }));
                        setTimeout(() => setBounceClasses(prev => ({ ...prev, [prayer.id]: '' })), 280);
                      })}
                      className="w-20 h-8 p-0 text-sm font-semibold rounded-lg flex items-center justify-center transition-all duration-200 bg-indigo-500 text-white hover:bg-indigo-600 shadow-md active:scale-95"
                      title="Increment pray count"
                    >
                      禱告記念
                    </button>
                  </div>
                </div>
             </div>
          ))}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="hidden lg:block lg:col-span-1">
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <h3 className="text-lg font-bold text-gray-800 mb-3">Sidebar Right</h3>
          <div className="bg-gray-200 rounded-lg h-40 flex items-center justify-center text-gray-500">
            右側位
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <h3 className="text-lg font-bold text-gray-800 mb-3">屬靈資源</h3>
          <div className="space-y-3">
            
                <p className="text-sm font-semibold text-gray-800 line-clamp-2">禱告手冊</p>
                <p className="text-xs text-gray-500 mt-1">默想與禱告</p>

                <p className="text-sm font-semibold text-gray-800 line-clamp-2">最真誠的禱告</p>
                <p className="text-xs text-gray-500 mt-1">代禱夥伴牽手計劃</p>
             
          </div>
        </div>
      </div> 
          <ShareModal
          isOpen={!!sharePrayer}
          onClose={() => setSharePrayer(null)}
          prayerId={sharePrayer?.id}
          prayerTitle={sharePrayer?.description || ''}
        />

        <CommentModal
          isOpen={!!commentPrayer}
          onClose={() => setCommentPrayer(null)}
          prayerId={commentPrayer?.id}
          currentUser={currentUser}
          updateCommentCount={updateCommentCount}
        />

       {/* Lightbox Modal */}
       {lightboxImage && currentPrayerRef.current && (
         <div
           className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
           onClick={handleTouch(() => setLightboxImage(null))}
         >
           <button
             className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors p-2 sm:p-3"
             onClick={handleTouch(() => setLightboxImage(null))}
           >
             <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
             </svg>
           </button>
           
           {/* Navigation Buttons */}
           {currentPrayerRef.current.images.length > 1 && (
             <>
               <button
                 className={`absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors p-2 sm:p-3 ${lightboxIndex === 0 ? 'opacity-0 pointer-events-none' : ''}`}
                 onClick={handleTouch((e) => {
                   if (lightboxIndex > 0) {
                     setLightboxIndex(lightboxIndex - 1);
                     setLightboxImage(currentPrayerRef.current!.images[lightboxIndex - 1]);
                   }
                 })}
               >
                 <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                 </svg>
               </button>
               
               <button
                 className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors p-2 sm:p-3 ${lightboxIndex === currentPrayerRef.current!.images.length - 1 ? 'opacity-0 pointer-events-none' : ''}`}
                 onClick={handleTouch((e) => {
                   if (currentPrayerRef.current && lightboxIndex < currentPrayerRef.current.images.length - 1) {
                     setLightboxIndex(lightboxIndex + 1);
                     setLightboxImage(currentPrayerRef.current.images[lightboxIndex + 1]);
                   }
                 })}
               >
                 <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                 </svg>
               </button>
             </>
           )}
           
           <img
             src={lightboxImage}
             alt="Lightbox"
             className="max-w-full max-h-[90vh] object-contain rounded-lg"
             onClick={handleTouch((e) => e?.stopPropagation())}
           />
         </div>
       )}
     </div>
     </div>
     </div>
     </>
   );
 }

export default PrayList;


