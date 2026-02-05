import { useState } from 'react';
//import { useNavigate } from 'react-router-dom';
//import logo from '../src/assets/logo.jpg';
//import userIcon from '../src/assets/user.svg';
import defaultImage from '../src/assets/default.jpg';
import coverPatient from '../src/assets/cover_patient.jpg';
import coverKid from '../src/assets/cover_kid.jpg';
import coverCancer from '../src/assets/cover_cancer.jpg';
import coverFamily from '../src/assets/cover_family.jpg';
import coverCare from '../src/assets/cover_care.jpg';
import type { PrayerItem as PrayerItemType } from './types';

const categories = [
  '病人醫治',
  '心理支持',
  '兒童病患',
  '癌症病患',
  '家庭關係',
  '長期照護'
];

// Category to default image mapping
const categoryToImage: Record<string, string> = {
  '病人醫治': coverPatient,
  '心理支持': defaultImage,
  '兒童病患': coverKid,
  '癌症病患': coverCancer,
  '家庭關係': coverFamily,
  '長期照護': coverCare
};

interface PrayerRequestModalProps {
  prayers: PrayerItemType[];
  setPrayers: (prayers: PrayerItemType[]) => void;
  onClose: () => void;
  currentUser: string;
}

function PrayerRequestModal({ prayers, setPrayers, onClose, currentUser }: PrayerRequestModalProps) {
  //const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isPreview, setIsPreview] = useState(false);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    
    // Check if adding new files would exceed the limit
    if (imageFiles.length + newFiles.length > 5) {
      alert('最多只能上傳 5 張照片');
      return;
    }
    
    // Keep existing files and append new ones
    const updatedFiles = [...imageFiles, ...newFiles];
    setImageFiles(updatedFiles);

    // Create previews for new files only
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    const updatedPreviews = [...imagePreviews, ...newPreviews];
    setImagePreviews(updatedPreviews);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || selectedCategories.length === 0) {
      alert('請填寫所有必填欄位');
      return;
    }

    // Show preview
    setIsPreview(true);
  };

  const handleConfirm = () => {
      // Convert image files to URLs, or use category-specific default image if no images uploaded
      const imageUrls = imageFiles.length > 0
        ? imageFiles.map(file => URL.createObjectURL(file))
        : [selectedCategories.length > 0 ? categoryToImage[selectedCategories[0]] : defaultImage];

      const newPrayer: PrayerItemType = {
        id: Date.now(),
        title: title.trim(),
        category: selectedCategories,
        description: description.trim(),
        userName: currentUser,
        prayCount: 0,
        date: new Date().toISOString().split('T')[0],
        images: imageUrls,
        status: 'pending'
      };

      setPrayers([newPrayer, ...prayers]);
      setIsPreview(false);
      onClose();
    };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col 
             w-[95%] md:w-[80%] h-[95%] md:h-[80%] mx-auto"
       
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 relative">
          <h2 className="text-2xl font-bold text-indigo-700">發出代禱事項</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
         
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-6">
          {!isPreview ? (
            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                標題 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="請輸入禱告事項標題"
                className="w-full px-4 py-3 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-15">
              {/* Description */}
              <div className="w-full mb-5 md:mb-0">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  描述 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="請詳細描述您的禱告事項"
                  rows={3}
                  className="w-full px-4 py-3 border text-gray-700 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none h-full"
                  required
                />
              </div>

              {/* Photo Upload */}
              <div className="w-full">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  照片 <span className="text-gray-400">(可選，最多 5 張)</span>
                </label>
                {imageFiles.length >= 5 && (
                  <p className="text-sm text-red-500 mt-1">已達到最大上傳數量 (5 張)</p>
                )}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-500 transition-colors cursor-pointer h-full flex flex-col justify-center">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <div className="text-gray-500">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="mt-2 text-sm">點擊上傳照片</p>
                      <p className="text-xs text-gray-400 mt-1">或拖曳照片到這裡</p>
                    </div>
                  </label>
                </div>
              </div>


              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreviews(prev => prev.filter((_, i) => i !== index));
                          setImageFiles(prev => prev.filter((_, i) => i !== index));
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
            </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  類別 <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => handleCategoryToggle(category)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${selectedCategories.includes(category)
                        ? 'bg-indigo-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>


            

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-600 active:bg-indigo-700 transition-all duration-200 shadow-md"
              >
                提交
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all duration-200"
              >
                取消
              </button>
            </div>
          </form>
          ) : (
            // Preview View
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">確認您的代禱事項</h3>
              
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-1">標題</label>
                <p className="text-lg font-semibold text-gray-800">{title}</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-1">描述</label>
                <p className="text-gray-700 whitespace-pre-wrap">{description}</p>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-semibold text-gray-500 mb-1">類別</label>
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.map((category) => (
                    <span
                      key={category}
                      className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-semibold"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>

              {/* Images */}
              {imagePreviews.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-500 mb-1">照片</label>
                  <div className="grid grid-cols-2 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsPreview(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all duration-200"
                >
                  返回修改
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex-1 px-6 py-3 bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-600 active:bg-indigo-700 transition-all duration-200 shadow-md"
                >
                  確認提交
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PrayerRequestModal;