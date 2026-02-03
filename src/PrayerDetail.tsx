import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination } from 'swiper/modules';
import prayIcon from '../src/assets/pray.png';
import voiceIcon from '../src/assets/voice.png';
import photoIcon from '../src/assets/photo.png';

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

interface Comment {
  id: number;
  userName: string;
  content: string;
  date: string;
  prayCount: number;
  replies: Comment[];
  images?: string[];
  audio?: string | null;
}

interface PrayerDetailProps {
  prayers: PrayerItem[];
  incrementPrayCount: (id: number) => void;
  incrementCommentPrayCount?: (commentId: number) => void;
}

function PrayerDetail({ prayers, incrementPrayCount, incrementCommentPrayCount }: PrayerDetailProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const prayer = prayers.find(p => p.id === parseInt(id || '0'));

  const [newComment, setNewComment] = useState('');
  const [newReply, setNewReply] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [attachedImages, setAttachedImages] = useState<File[]>([]);
  const [attachedAudio, setAttachedAudio] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      userName: '王姐妹',
      content: '為您禱告，願主賜下醫治與力量。為您禱告，願主賜下醫治與力量。為您禱告，願主賜下醫治與力量。為您禱告，願主賜下醫治與力量。',
      date: '2026-02-02',
      prayCount: 5,
      replies: []
    },
    {
      id: 2,
      userName: '李弟兄',
      content: '同心代禱，相信神會聽我們的禱告。',
      date: '2026-02-01',
      prayCount: 3,
      replies: []
    }
  ]);

  const [mainAttachedImages, setMainAttachedImages] = useState<File[]>([]);
  const [mainAttachedAudio, setMainAttachedAudio] = useState<string | null>(null);
  const [mainIsRecording, setMainIsRecording] = useState(false);
  const [mainMediaRecorder, setMainMediaRecorder] = useState<MediaRecorder | null>(null);
  const [bounceClass, setBounceClass] = useState('');
  const [commentBounceClasses, setCommentBounceClasses] = useState<Record<number, string>>({});
  const [bouncingCommentIcons, setBouncingCommentIcons] = useState<Set<number>>(new Set());
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const replyImageInputRef = useRef<HTMLInputElement>(null);

  if (!prayer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-50 p-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">找不到禱告事項</h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all duration-200"
          >
            返回列表
          </button>
        </div>
      </div>
    );
  }

  const handleAddComment = () => {
    if (newComment.trim() || mainAttachedImages.length > 0 || mainAttachedAudio) {
      const comment: Comment = {
        id: comments.length + 1,
        userName: '訪客',
        content: newComment.trim(),
        date: new Date().toISOString().split('T')[0],
        prayCount: 0,
        replies: [],
        images: mainAttachedImages.map(file => URL.createObjectURL(file)),
        audio: mainAttachedAudio
      };
      setComments([...comments, comment]);
      setNewComment('');
      setMainAttachedImages([]);
      setMainAttachedAudio(null);
    }
  };

  const handleIncrementCommentPrayCount = (commentId: number) => {
    setComments(comments.map(comment =>
      comment.id === commentId
        ? { ...comment, prayCount: comment.prayCount + 1 }
        : comment
    ));
  };

  const handleAddReply = (commentId: number) => {
    if (newReply.trim()) {
      const reply: Comment = {
        id: Date.now(), // Simple ID generation
        userName: '訪客',
        content: newReply.trim(),
        date: new Date().toISOString().split('T')[0],
        prayCount: 0,
        replies: [],
        images: attachedImages.map(file => URL.createObjectURL(file)),
        audio: attachedAudio
      };
      setComments(comments.map(comment =>
        comment.id === commentId
          ? { ...comment, replies: [...comment.replies, reply] }
          : comment
      ));
      setNewReply('');
      setReplyingTo(null);
      setAttachedImages([]);
      setAttachedAudio(null);
    }
  };

  const removeImage = (index: number) => {
    setAttachedImages(attachedImages.filter((_, i) => i !== index));
  };

  const removeAudio = () => {
    setAttachedAudio(null);
  };

  const handleImageAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Validate file types and sizes
      const validFiles = files.filter(file => {
        const isValidType = file.type.startsWith('image/');
        const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
        if (!isValidType) {
          alert(`檔案 ${file.name} 不是有效的圖片格式。`);
          return false;
        }
        if (!isValidSize) {
          alert(`檔案 ${file.name} 太大，請選擇小於10MB的圖片。`);
          return false;
        }
        return true;
      });

      if (validFiles.length > 0) {
        setAttachedImages([...attachedImages, ...validFiles]);
        // Reset input value to allow re-selecting the same file
        e.target.value = '';
      }
    }
  };

  const handleVoiceRecord = async () => {
    if (isRecording) {
      mediaRecorder?.stop();
      setIsRecording(false);
    } else {
      try {
        // Check if getUserMedia is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          alert('您的瀏覽器不支持語音錄製功能。請使用現代瀏覽器或更新您的應用程式。');
          return;
        }

        // For Safari compatibility, use basic audio constraints
        const constraints = {
          audio: navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')
            ? true  // Safari prefers simple boolean
            : {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                sampleRate: 44100,
                channelCount: 1
              }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        // Determine best MIME type for the browser
        let mimeType = 'audio/webm';
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/wav')) {
          mimeType = 'audio/wav';
        }

        const recorder = new MediaRecorder(stream, { mimeType });
        const chunks: Blob[] = [];

        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType });
          const url = URL.createObjectURL(blob);
          setAttachedAudio(url);
          stream.getTracks().forEach(track => track.stop());
        };

        setMediaRecorder(recorder);
        recorder.start();
        setIsRecording(true);
      } catch (err: any) {
        console.error('Error accessing microphone:', err);
        let errorMessage = '無法訪問麥克風。';

        if (err.name === 'NotAllowedError') {
          errorMessage = '請允許訪問麥克風權限，然後重試。';
        } else if (err.name === 'NotFoundError') {
          errorMessage = '未找到麥克風設備。';
        } else if (err.name === 'NotSupportedError') {
          errorMessage = '您的設備不支持語音錄製。';
        } else if (err.name === 'NotReadableError') {
          errorMessage = '麥克風被其他應用程式佔用。';
        } else if (err.name === 'AbortError') {
          errorMessage = '錄製被中斷，請重試。';
        }

        alert(errorMessage);
      }
    }
  };

  const removeMainImage = (index: number) => {
    setMainAttachedImages(mainAttachedImages.filter((_, i) => i !== index));
  };

  const removeMainAudio = () => {
    setMainAttachedAudio(null);
  };

  const handleMainImageAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setMainAttachedImages([...mainAttachedImages, ...files]);
  };

  const handleMainVoiceRecord = async () => {
    if (mainIsRecording) {
      mainMediaRecorder?.stop();
      setMainIsRecording(false);
    } else {
      try {
        // Check if getUserMedia is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          alert('您的瀏覽器不支持語音錄製功能。請使用現代瀏覽器或更新您的應用程式。');
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });

        const recorder = new MediaRecorder(stream, {
          mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
        });
        const chunks: Blob[] = [];

        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: recorder.mimeType });
          const url = URL.createObjectURL(blob);
          setMainAttachedAudio(url);
          stream.getTracks().forEach(track => track.stop());
        };

        setMainMediaRecorder(recorder);
        recorder.start();
        setMainIsRecording(true);
      } catch (err: any) {
        console.error('Error accessing microphone:', err);
        let errorMessage = '無法訪問麥克風。';

        if (err.name === 'NotAllowedError') {
          errorMessage = '請允許訪問麥克風權限，然後重試。';
        } else if (err.name === 'NotFoundError') {
          errorMessage = '未找到麥克風設備。';
        } else if (err.name === 'NotSupportedError') {
          errorMessage = '您的設備不支持語音錄製。';
        } else if (err.name === 'NotReadableError') {
          errorMessage = '麥克風被其他應用程式佔用。';
        }

        alert(errorMessage);
      }
    }
  };

  const renderComment = (comment: Comment, isReply: boolean = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-6 mt-3' : ''} border-b border-gray-100 pb-3 last:border-b-0`}>
      <div className="flex justify-between items-start mb-2">
        <span className="font-semibold text-gray-900">{comment.userName}</span>
        <span className="text-xs text-gray-500">{comment.date}</span>
      </div>
      <p className="text-gray-700 text-sm mb-2">{comment.content}</p>
      {/* Display attached media */}
      {comment.images && comment.images.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2 mb-2">
          {comment.images.map((image, imgIndex) => (
            <img
              key={imgIndex}
              src={image}
              alt={`Attachment ${imgIndex + 1}`}
              className="w-16 h-16 object-cover rounded border"
            />
          ))}
        </div>
      )}

      {comment.audio && (
        <div className="mt-2 mb-2">
          <audio controls src={comment.audio} className="w-full" />
        </div>
      )}
      <div className="flex items-center justify-between">
        <button
          className="text-base text-gray-500 hover:text-gray-700 transition-colors"
          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
        >
          回覆
        </button>
        <div className="flex items-center">
          <span className="flex items-center gap-2 text-black pr-2">
            <img src={prayIcon} className={`w-7 h-7 -scale-x-100 -translate-x-[-5px] transform duration-1000 ${bouncingCommentIcons.has(comment.id) ? '-scale-x-150 scale-y-150' : '-scale-100 scale-y-100 '} `} alt="禱告" />
            <span className="text-sm text-gray-600 mr-2">{comment.prayCount}</span>
          </span>
          <button
            onClick={() => {
              handleIncrementCommentPrayCount(comment.id);
              setBouncingCommentIcons(prev => new Set(prev).add(comment.id));
              setTimeout(() => setBouncingCommentIcons(prev => {
                const newSet = new Set(prev);
                newSet.delete(comment.id);
                return newSet;
              }), 280);
            }}
            className={`text-sm px-2 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors transform duration-1000`}
          >
            阿門
          </button>
        </div>
      </div>
      {replyingTo === comment.id && (
        <div className="mt-3">
          <textarea
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            placeholder="留下您的回覆..."
            className="w-82 p-2 m-1 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none sm:w-77"
            rows={2}
          />

          {/* Media Attachments Preview */}
          {attachedImages.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {attachedImages.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Attachment ${index + 1}`}
                    className="w-16 h-16 object-cover rounded border"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {attachedAudio && (
            <div className="mt-2 flex items-center gap-2">
              <audio controls src={attachedAudio} className="flex-1" />
              <button
                onClick={removeAudio}
                className="bg-red-500 text-white rounded px-2 py-1 text-xs"
              >
                移除
              </button>
            </div>
          )}

          {/* Media Attachment Buttons */}
          <div className="flex items-center gap-3 mt-3">
            <div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageAttach}
                className="hidden"
                ref={(el) => {
                  if (el) el.click = el.click.bind(el);
                }}
              />
              <button
                type="button"
                className="px-5 pr-2 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2 border border-blue-200"
                onClick={() => {
                  const input = document.querySelector(`input[type="file"][accept="image/*"][multiple]`) as HTMLInputElement;
                  input?.click();
                }}
              >
                <span className="flex items-center gap-2 text-black pr-2">
                  <img src={photoIcon} className="w-5 h-5 -scale-x-100 -translate-x-[0px]" alt="附加圖片" />
                  <span className="text-sm text-gray-600 mr-2">附加圖片</span>
                </span>

              </button>
            </div>

            <button
              type="button"
              onClick={handleVoiceRecord}
              className={`px-4 py-2 pr-6 text-sm rounded-lg transition-colors flex items-center gap-2 border ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse border-red-500'
                  : 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200'
              }`}
            >
              <img src={voiceIcon} className="w-5 h-5 -scale-x-100 -translate-x-[0px]" alt="語音" />
              {isRecording ? '錄音中...' : '語音錄製'}
            </button>
          </div>

          <div className="flex justify-end mt-2">
            <button
              onClick={() => {
                setReplyingTo(null);
                setAttachedImages([]);
                setAttachedAudio(null);
              }}
              className="mr-2 px-3 py-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              取消
            </button>
            <button
              onClick={() => handleAddReply(comment.id)}
              disabled={!newReply.trim() && attachedImages.length === 0 && !attachedAudio}
              className="px-3 py-1 text-xs bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              送出回覆
            </button>
          </div>
        </div>
      )}

      {comment.replies.map(reply => renderComment(reply, true))}
    </div>
  );

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
        <div className="max-w-6xl mx-auto relative mb-12">

          <div className="flex justify-between items-start p-10">
            <div className="mix-blend-multiply absolute inset-0 bg-red-200 bg-opacity-10 flex items-center justify-center text-white text-2xl font-bold">
            template header
          </div>
            <div className="w-30">
              <img src="/src/assets/logo.jpg" className="mix-blend-multiply"/>
            </div>

            <div className="flex items-center text-gray-500 text-xl">
              關於我們 | 我們的服務 | 支持我們 | 聯絡我們 |  <span className='text-yellow-900 pl-2'>代禱作戰室</span> |  登入 <img src="/src/assets/user.svg" className="w-7"/>
            </div>

          </div>

        </div>

        <div className="max-w-6xl mx-auto mb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors mb-4"
            >
              ← 返回列表
            </button>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{prayer.title}</h1>
                <div className="flex items-center text-gray-600 mb-4">
                  <span className="mr-4">{prayer.userName}</span>
                  <span>{prayer.date}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {prayer.category.map((cat, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                        cat === '病人醫治' ? 'bg-pink-100 text-pink-800' :
                        cat === '心理支持' ? 'bg-purple-100 text-purple-800' :
                        cat === '兒童病患' ? 'bg-green-100 text-green-800' :
                        cat === '癌症病患' ? 'bg-blue-100 text-blue-800' :
                        cat === '家庭關係' ? 'bg-red-100 text-red-800' :
                        cat === '長期照護' ? 'bg-yellow-100 text-yellow-800' :
                        cat === '癌症患者' ? 'bg-teal-100 text-teal-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Image Slider */}
              <div className="bg-white rounded-xl shadow-md p-2 mb-6 sm:p-4">
                <Swiper
                  modules={[Navigation, Pagination]}
                  spaceBetween={10}
                  slidesPerView={1}
                  navigation
                  pagination={{ clickable: true }}
                  className="w-full aspect-[16/9] rounded-lg"
                >
                  {prayer.images.map((image, index) => (
                    <SwiperSlide key={index}>
                      <img
                        src={image}
                        alt={`${prayer.title} ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

              {/* Description */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">禱告內容</h2>
                <p className="text-gray-700 leading-relaxed">{prayer.description}</p>
                <div className="flex justify-end items-center mt-4">
                                <span className="flex items-center gap-2 text-black pr-2">
                                  <img src={prayIcon} className={`w-7 h-7 -translate-x-[-5px] transition-transform duration-1000 ${bounceClass}`} alt="禱告" />
                                  <span className="font-bold text-sm text-gray-500">{prayer.prayCount}</span>
                                </span>
                                <button
                                  onClick={() => {
                                    incrementPrayCount(prayer.id);
                                    setBounceClass('scale-180');
                                    setTimeout(() => setBounceClass(''), 280);
                                  }}
                                  className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all duration-200 shadow-md"
                                >
                                  為您禱告
                                </button>
                              </div>
                </div>
            </div>

            {/* Comments Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">代禱留言</h3>

                {/* Comments List */}
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {comments.map((comment) => renderComment(comment))}
                </div>

                {/* Add Comment */}
                <div className="border-t border-gray-100 pt-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="留下您的代禱留言..."
                    className="w-full p-3 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    rows={3}
                  />

                  {/* Media Attachments Preview */}
                  {mainAttachedImages.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {mainAttachedImages.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Attachment ${index + 1}`}
                            className="w-16 h-16 object-cover rounded border"
                          />
                          <button
                            onClick={() => removeMainImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {mainAttachedAudio && (
                    <div className="mt-2 flex items-center gap-2">
                      <audio controls src={mainAttachedAudio} className="flex-1" />
                      <button
                        onClick={removeMainAudio}
                        className="bg-red-500 text-white rounded px-2 py-1 text-xs"
                      >
                        移除
                      </button>
                    </div>
                  )}

                  {/* Media Attachment Buttons */}
                  <div className="flex items-center gap-3 mt-3">
                    <div>
                      <input
                        ref={mainImageInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleMainImageAttach}
                        className="hidden"
                      />
                      <button
                        type="button"
                        className="px-5 pr-2 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2 border border-blue-200"
                        onClick={() => mainImageInputRef.current?.click()}
                      >
                        <span className="flex items-center gap-2 text-black pr-2">
                          <img src={photoIcon} className="w-5 h-5 -scale-x-100 -translate-x-[0px]" alt="附加圖片" />
                          <span className="text-sm text-gray-600 mr-2">附加圖片</span>
                        </span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleMainVoiceRecord}
                      className={`px-4 pr-6 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 border ${
                        mainIsRecording
                          ? 'bg-red-500 text-white animate-pulse border-red-500'
                          : 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200'
                      }`}
                    >
                      <span className="flex items-center gap-2 text-black pr-0">
                  <img src={voiceIcon} className="w-5 h-5 -scale-x-100 -translate-x-[0px]" alt="語音" />
                  </span> {mainIsRecording ? '錄音中...' : '語音錄製'}
                    </button>
                  </div>

                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() && mainAttachedImages.length === 0 && !mainAttachedAudio}
                    className="w-full mt-3 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    送出留言
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

export default PrayerDetail;
