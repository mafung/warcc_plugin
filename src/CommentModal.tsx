import { useState, useEffect } from 'react';
import prayIcon from '../src/assets/pray.png';
import photoIcon from '../src/assets/photo.png';
import voiceIcon from '../src/assets/voice.png';

// Helper function to handle both click and touch events
const handleTouch = (callback: (e?: React.MouseEvent | React.TouchEvent) => void) => (e: React.MouseEvent | React.TouchEvent) => {
  e.preventDefault();
  e.stopPropagation();
  callback(e);
};

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

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  prayerId?: number;
  currentUser: string;
  updateCommentCount?: (prayerId: number, commentCount: number) => void;
}

function CommentModal({ isOpen, onClose, prayerId, currentUser, updateCommentCount }: CommentModalProps) {
  // Store comments for each prayer separately
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [currentPrayerId, setCurrentPrayerId] = useState<number | null>(null);
  
  // Initialize comments for a specific prayer when modal opens
  useEffect(() => {
    if (isOpen && prayerId) {
      setCurrentPrayerId(prayerId);
      // Load existing comments for this prayer, or initialize with sample comments
      if (!comments[prayerId]) {
        // Generate unique sample comments based on prayerId
        const sampleComments: Comment[] = [
          {
            id: 1,
            userName: `禱告者${prayerId}`,
            content: `為這個代禱事項禱告，願主賜下醫治與力量。`,
            date: '2026-02-02',
            prayCount: 5,
            replies: []
          },
          {
            id: 2,
            userName: `代禱者${prayerId + 1}`,
            content: `同心代禱，相信神會聽我們的禱告。`,
            date: '2026-02-01',
            prayCount: 3,
            replies: []
          }
        ];
        setComments(prev => ({
          ...prev,
          [prayerId]: sampleComments
        }));
      }
    }
  }, [isOpen, prayerId, comments]);

  const [newComment, setNewComment] = useState('');
  const [newReply, setNewReply] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [attachedImages, setAttachedImages] = useState<File[]>([]);
  const [attachedAudio, setAttachedAudio] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [bouncingCommentIcons, setBouncingCommentIcons] = useState<Set<number>>(new Set());

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddComment = () => {
    if (newComment.trim() || attachedImages.length > 0 || attachedAudio) {
      if (!currentPrayerId) return;

      const comment: Comment = {
        id: Date.now(),
        userName: currentUser,
        content: newComment.trim(),
        date: new Date().toISOString().split('T')[0],
        prayCount: 0,
        replies: [],
        images: attachedImages.map(file => URL.createObjectURL(file)),
        audio: attachedAudio
      };
      const currentComments = comments[currentPrayerId] || [];
      const newComments = [comment, ...currentComments];
      setComments(prev => ({
        ...prev,
        [currentPrayerId]: newComments
      }));
      // Update the comment count in the main prayers data
      if (updateCommentCount) {
        updateCommentCount(currentPrayerId, newComments.length);
      }
      setNewComment('');
      setAttachedImages([]);
      setAttachedAudio(null);
    }
  };

  const handleIncrementCommentPrayCount = (commentId: number) => {
    if (!currentPrayerId) return;
    setComments(prev => ({
      ...prev,
      [currentPrayerId]: prev[currentPrayerId]?.map(comment =>
        comment.id === commentId
          ? { ...comment, prayCount: comment.prayCount + 1 }
          : comment
      ) || []
    }));
  };

  const handleAddReply = (commentId: number) => {
    if (newReply.trim() && currentPrayerId) {
      const reply: Comment = {
        id: Date.now(),
        userName: currentUser,
        content: newReply.trim(),
        date: new Date().toISOString().split('T')[0],
        prayCount: 0,
        replies: [],
        images: attachedImages.map(file => URL.createObjectURL(file)),
        audio: attachedAudio
      };
      setComments(prev => ({
        ...prev,
        [currentPrayerId]: prev[currentPrayerId]?.map(comment =>
          comment.id === commentId
            ? { ...comment, replies: [...comment.replies, reply] }
            : comment
        ) || []
      }));
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
      const validFiles = files.filter(file => {
        const isValidType = file.type.startsWith('image/');
        const isValidSize = file.size <= 10 * 1024 * 1024;
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
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          alert('您的瀏覽器不支持語音錄製功能。請使用現代瀏覽器或更新您的應用程式。');
          return;
        }

        const constraints = {
          audio: navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')
            ? true
            : {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              sampleRate: 44100,
              channelCount: 1
            }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);

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

  const renderComment = (comment: Comment, isReply: boolean = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-6 mt-3' : ''} border-b border-rose-200 pb-3 last:border-b-0`}>
      <div className="flex justify-between items-start mb-2">
        <span className="font-semibold text-gray-900">{comment.userName}</span>
        <span className="text-xs text-gray-500">{comment.date}</span>
      </div>
      <p className="text-gray-700 text-sm mb-2">{comment.content}</p>
      {comment.images && comment.images.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2 mb-2">
          {comment.images.map((image, imgIndex) => (
            <img
              key={imgIndex}
              src={image}
              alt={`Attachment ${imgIndex + 1}`}
              className="w-16 h-16 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity active:scale-95"
              onClick={handleTouch(() => {
                // Add lightbox functionality for images in comments
                alert('圖片預覽功能即將推出');
              })}
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
          className="text-base text-rose-400 hover:text-rose-700 transition-colors active:scale-95"
          onClick={handleTouch(() => setReplyingTo(replyingTo === comment.id ? null : comment.id))}
        >
          回覆
        </button>
        <div className="flex items-center">
          <span className="flex items-center gap-2 text-black pr-2">
            <img src={prayIcon} className={`w-7 h-7 -scale-x-100 -translate-x-[-5px] transform duration-1000 ${bouncingCommentIcons.has(comment.id) ? '-scale-x-150 scale-y-150' : '-scale-100 scale-y-100 '} `} alt="禱告" />
            <span className="text-sm text-gray-600 mr-2">{comment.prayCount}</span>
          </span>
          <button
            onClick={handleTouch(() => {
              handleIncrementCommentPrayCount(comment.id);
              setBouncingCommentIcons(prev => new Set(prev).add(comment.id));
              setTimeout(() => setBouncingCommentIcons(prev => {
                const newSet = new Set(prev);
                newSet.delete(comment.id);
                return newSet;
              }), 280);
            })}
            className={`text-sm px-2 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors transform duration-1000 active:scale-95`}
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
            className="w-full p-2 m-1 bg-white text-rose-400 border border-rose-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
            rows={2}
          />
          {attachedImages.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {attachedImages.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Attachment ${index + 1}`}
                    className="w-16 h-16 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity active:scale-95"
                    onClick={handleTouch(() => {
                      // Add lightbox functionality for attached images
                      alert('圖片預覽功能即將推出');
                    })}
                  />
                  <button
                    onClick={handleTouch(() => removeImage(index))}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center active:scale-95"
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
          <div className="flex items-center gap-3 mt-3">
            <div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageAttach}
                className="hidden"
              />
              <button
                type="button"
                className="px-5 pr-2 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2 border border-blue-200 active:scale-95"
                onClick={handleTouch(() => {
                  const input = document.querySelector(`input[type="file"][accept="image/*"][multiple]`) as HTMLInputElement;
                  input?.click();
                })}
              >
                <span className="flex items-center gap-2 text-black pr-2">
                  <img src={photoIcon} className="w-5 h-5 -scale-x-100 -translate-x-[0px]" alt="附加圖片" />
                  <span className="text-sm text-gray-600 mr-2">附加圖片</span>
                </span>
              </button>
            </div>
            <button
              type="button"
              onClick={handleTouch(handleVoiceRecord)}
              className={`px-4 py-2 pr-6 text-sm rounded-lg transition-colors flex items-center gap-2 border ${isRecording
                  ? 'bg-red-500 text-white animate-pulse border-red-500'
                  : 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200'
                } active:scale-95`}
            >
              <img src={voiceIcon} className="w-5 h-5 -scale-x-100 -translate-x-[0px]" alt="語音" />
              {isRecording ? '錄音中...' : '語音錄製'}
            </button>
          </div>
          <div className="flex justify-end mt-2">
            <button
              onClick={handleTouch(() => {
                setReplyingTo(null);
                setAttachedImages([]);
                setAttachedAudio(null);
              })}
              className="mr-2 px-3 py-1 text-xs text-gray-500 hover:text-gray-700 transition-colors active:scale-95"
            >
              取消
            </button>
            <button
              onClick={handleTouch(() => handleAddReply(comment.id))}
              disabled={!newReply.trim() && attachedImages.length === 0 && !attachedAudio}
              className="px-3 py-1 text-xs bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors active:scale-95"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 transition-opacity"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">代禱留言</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
            {currentPrayerId && comments[currentPrayerId]
              ? [...comments[currentPrayerId]].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((comment) => renderComment(comment))
              : <p className="text-gray-500 text-center">暫無留言</p>}
          </div>
          <div className="border-t border-gray-100 pt-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="留下您的代禱留言..."
              className="w-full bg-white p-3 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
            {attachedImages.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {attachedImages.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Attachment ${index + 1}`}
                      className="w-16 h-16 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity active:scale-95"
                      onClick={handleTouch(() => {
                        // Add lightbox functionality for attached images
                        alert('圖片預覽功能即將推出');
                      })}
                    />
                    <button
                      onClick={handleTouch(() => removeImage(index))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center active:scale-95"
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
            <div className="flex items-center gap-3 mt-3">
              <div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageAttach}
                  className="hidden"
                />
                <button
                  type="button"
                  className="px-5 pr-2 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2 border border-blue-200 active:scale-95"
                  onClick={handleTouch(() => {
                    const input = document.querySelector(`input[type="file"][accept="image/*"][multiple]`) as HTMLInputElement;
                    input?.click();
                  })}
                >
                  <span className="flex items-center gap-2 text-black pr-2">
                    <img src={photoIcon} className="w-5 h-5 -scale-x-100 -translate-x-[0px]" alt="附加圖片" />
                    <span className="text-sm text-gray-600 mr-2">附加圖片</span>
                  </span>
                </button>
              </div>
              <button
                type="button"
                onClick={handleTouch(handleVoiceRecord)}
                className={`px-4 pr-6 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 border ${isRecording
                    ? 'bg-red-500 text-white animate-pulse border-red-500'
                    : 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200'
                  } active:scale-95`}
              >
                <span className="flex items-center gap-2 text-black pr-0">
                  <img src={voiceIcon} className="w-5 h-5 -scale-x-100 -translate-x-[0px]" alt="語音" />
                </span> {isRecording ? '錄音中...' : '語音錄製'}
              </button>
            </div>
            <button
              onClick={handleTouch(handleAddComment)}
              disabled={!newComment.trim() && attachedImages.length === 0 && !attachedAudio}
              className="w-full mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-200 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
            >
              送出留言
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommentModal;