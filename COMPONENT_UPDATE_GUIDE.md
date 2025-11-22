# コンポーネント更新ガイド（マルチメディア対応）

このガイドでは、既存コンポーネントをマルチメディア（画像・音声）対応にするための実装方法を説明します。

---

## 🎯 更新が必要なコンポーネント

### 1. QuestionEditor.tsx（講師用・問題編集）
### 2. QuizRunner.tsx（生徒用・クイズ実行）
### 3. Chapter一覧ページ（教科選択機能追加）

---

## 📝 実装例

### 1. QuestionEditor.tsx の更新

#### 追加する機能
- 画像アップロードフィールド（問題文・選択肢・解説）
- 音声アップロードフィールド（問題文）
- メディアプレビュー
- ファイル削除機能

#### コード例

```tsx
'use client'

import { useState } from 'react'
import { uploadMediaFile, deleteMediaFile, validateFileType, validateFileSize } from '@/lib/storage/media-upload'
import type { Question, MediaType } from '@/lib/types/database'
import Image from 'next/image'

interface MediaUploadFieldProps {
  label: string
  mediaType: 'image' | 'audio'
  currentUrl: string | null
  onUpload: (url: string) => void
  onDelete: () => void
  questionId: number | null
  fieldName: string
}

function MediaUploadField({
  label,
  mediaType,
  currentUrl,
  onUpload,
  onDelete,
  questionId,
  fieldName
}: MediaUploadFieldProps) {
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // バリデーション
    if (!validateFileType(file, mediaType)) {
      alert(`${mediaType === 'image' ? '画像' : '音声'}ファイルを選択してください`)
      return
    }
    if (!validateFileSize(file)) {
      alert('ファイルサイズは10MB以下にしてください')
      return
    }

    setUploading(true)
    try {
      const result = await uploadMediaFile(file, questionId, mediaType, fieldName)
      onUpload(result.url)
    } catch (error) {
      console.error('アップロードエラー:', error)
      alert('アップロードに失敗しました')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!currentUrl) return
    if (!confirm('削除してよろしいですか？')) return

    try {
      await deleteMediaFile(currentUrl)
      onDelete()
    } catch (error) {
      console.error('削除エラー:', error)
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>

      {/* プレビュー */}
      {currentUrl && (
        <div className="relative">
          {mediaType === 'image' ? (
            <div className="relative w-full h-48 bg-gray-100 rounded">
              <Image
                src={currentUrl}
                alt={label}
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <audio src={currentUrl} controls className="w-full" />
          )}
          <button
            type="button"
            onClick={handleDelete}
            className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs"
          >
            削除
          </button>
        </div>
      )}

      {/* アップロードボタン */}
      <input
        type="file"
        accept={mediaType === 'image' ? 'image/*' : 'audio/*'}
        onChange={handleFileChange}
        disabled={uploading}
        className="block w-full text-sm"
      />
      {uploading && <p className="text-sm text-gray-500">アップロード中...</p>}
    </div>
  )
}

// QuestionEditor本体での使用例
export default function QuestionEditor() {
  const [questionData, setQuestionData] = useState<Partial<Question>>({
    question_text: '',
    media_type: 'text',
    // ... 他のフィールド
  })

  return (
    <form className="space-y-4">
      {/* 問題タイプ選択 */}
      <div>
        <label className="block text-sm font-medium mb-2">問題タイプ</label>
        <select
          value={questionData.media_type}
          onChange={(e) => setQuestionData({ ...questionData, media_type: e.target.value as MediaType })}
          className="w-full border rounded p-2"
        >
          <option value="text">テキストのみ</option>
          <option value="image">画像あり（有機化学など）</option>
          <option value="audio">音声あり（リスニング）</option>
          <option value="mixed">複合</option>
        </select>
      </div>

      {/* 問題文 */}
      <div>
        <label className="block text-sm font-medium mb-2">問題文</label>
        <textarea
          value={questionData.question_text}
          onChange={(e) => setQuestionData({ ...questionData, question_text: e.target.value })}
          className="w-full border rounded p-2"
          rows={3}
        />
      </div>

      {/* 問題文の画像（media_typeがimageまたはmixedの場合） */}
      {(questionData.media_type === 'image' || questionData.media_type === 'mixed') && (
        <MediaUploadField
          label="問題文の画像（構造式など）"
          mediaType="image"
          currentUrl={questionData.question_image_url || null}
          onUpload={(url) => setQuestionData({ ...questionData, question_image_url: url })}
          onDelete={() => setQuestionData({ ...questionData, question_image_url: null })}
          questionId={questionData.id || null}
          fieldName="question_image"
        />
      )}

      {/* 問題文の音声（media_typeがaudioまたはmixedの場合） */}
      {(questionData.media_type === 'audio' || questionData.media_type === 'mixed') && (
        <MediaUploadField
          label="問題文の音声"
          mediaType="audio"
          currentUrl={questionData.question_audio_url || null}
          onUpload={(url) => setQuestionData({ ...questionData, question_audio_url: url })}
          onDelete={() => setQuestionData({ ...questionData, question_audio_url: null })}
          questionId={questionData.id || null}
          fieldName="question_audio"
        />
      )}

      {/* 選択肢A */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">選択肢A</label>
        <input
          type="text"
          value={questionData.choice_a}
          onChange={(e) => setQuestionData({ ...questionData, choice_a: e.target.value })}
          className="w-full border rounded p-2"
        />

        {/* 選択肢Aの画像 */}
        {questionData.media_type === 'image' && (
          <MediaUploadField
            label="選択肢Aの画像"
            mediaType="image"
            currentUrl={questionData.choice_a_image_url || null}
            onUpload={(url) => setQuestionData({ ...questionData, choice_a_image_url: url })}
            onDelete={() => setQuestionData({ ...questionData, choice_a_image_url: null })}
            questionId={questionData.id || null}
            fieldName="choice_a_image"
          />
        )}
      </div>

      {/* 選択肢B, C, D も同様に実装 */}

      {/* 解説 */}
      <div>
        <label className="block text-sm font-medium mb-2">解説</label>
        <textarea
          value={questionData.explanation || ''}
          onChange={(e) => setQuestionData({ ...questionData, explanation: e.target.value })}
          className="w-full border rounded p-2"
          rows={3}
        />

        {/* 解説の画像 */}
        <MediaUploadField
          label="解説の画像"
          mediaType="image"
          currentUrl={questionData.explanation_image_url || null}
          onUpload={(url) => setQuestionData({ ...questionData, explanation_image_url: url })}
          onDelete={() => setQuestionData({ ...questionData, explanation_image_url: null })}
          questionId={questionData.id || null}
          fieldName="explanation_image"
        />
      </div>

      {/* 保存ボタン */}
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        保存
      </button>
    </form>
  )
}
```

---

### 2. QuizRunner.tsx の更新

#### 追加する機能
- 問題文の画像表示
- 問題文の音声再生
- 選択肢の画像表示

#### コード例

```tsx
'use client'

import { useState } from 'react'
import type { Question } from '@/lib/types/database'
import Image from 'next/image'

interface QuestionDisplayProps {
  question: Question
  onAnswer: (answer: 'A' | 'B' | 'C' | 'D') => void
}

export default function QuestionDisplay({ question, onAnswer }: QuestionDisplayProps) {
  return (
    <div className="space-y-6">
      {/* 問題文 */}
      <div>
        <h2 className="text-xl font-bold mb-4">{question.question_text}</h2>

        {/* 問題文の画像 */}
        {question.question_image_url && (
          <div className="relative w-full h-64 bg-gray-50 rounded mb-4">
            <Image
              src={question.question_image_url}
              alt="問題の画像"
              fill
              className="object-contain"
            />
          </div>
        )}

        {/* 問題文の音声 */}
        {question.question_audio_url && (
          <div className="mb-4">
            <audio src={question.question_audio_url} controls className="w-full" />
          </div>
        )}
      </div>

      {/* 選択肢 */}
      <div className="space-y-3">
        {(['A', 'B', 'C', 'D'] as const).map((choice) => {
          const choiceText = question[`choice_${choice.toLowerCase()}` as keyof Question] as string
          const choiceImageUrl = question[`choice_${choice.toLowerCase()}_image_url` as keyof Question] as string | null

          return (
            <button
              key={choice}
              onClick={() => onAnswer(choice)}
              className="w-full text-left border-2 rounded-lg p-4 hover:border-blue-500 transition"
            >
              <div className="flex items-start gap-3">
                <span className="font-bold text-lg">{choice}.</span>
                <div className="flex-1">
                  <p className="mb-2">{choiceText}</p>

                  {/* 選択肢の画像 */}
                  {choiceImageUrl && (
                    <div className="relative w-full h-32 bg-gray-50 rounded">
                      <Image
                        src={choiceImageUrl}
                        alt={`選択肢${choice}の画像`}
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

---

### 3. 教科選択ページの追加

#### 新規ファイル: `app/subjects/page.tsx`

```tsx
'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database, Subject } from '@/lib/types/database'
import Link from 'next/link'

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    async function fetchSubjects() {
      const { data } = await supabase
        .from('mukimuki_subjects')
        .select('*')
        .order('display_order')

      if (data) setSubjects(data)
    }
    fetchSubjects()
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">教科を選択</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subjects.map((subject) => (
          <Link
            key={subject.id}
            href={`/subjects/${subject.id}/chapters`}
            className="border-2 rounded-lg p-6 hover:border-blue-500 transition"
          >
            <h2 className="text-xl font-bold mb-2">{subject.name}</h2>
            {subject.description && (
              <p className="text-gray-600 text-sm">{subject.description}</p>
            )}
            <div className="mt-3">
              <span className="inline-block px-2 py-1 bg-gray-100 rounded text-xs">
                {subject.media_type === 'text' && 'テキスト問題'}
                {subject.media_type === 'image' && '画像問題対応'}
                {subject.media_type === 'audio' && '音声問題対応'}
                {subject.media_type === 'mixed' && '複合問題'}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

---

## 🔧 実装時の注意点

### 1. 画像の最適化
```tsx
// Next.jsのImageコンポーネントを使用
import Image from 'next/image'

// next.config.js でSupabaseドメインを許可
module.exports = {
  images: {
    domains: ['hlfpnquhlkqjsqsipnea.supabase.co'],
  },
}
```

### 2. 音声ファイルのプリロード
```tsx
// クイズ開始時に音声をプリロード
useEffect(() => {
  if (question.question_audio_url) {
    const audio = new Audio(question.question_audio_url)
    audio.preload = 'auto'
  }
}, [question])
```

### 3. エラーハンドリング
```tsx
// 画像読み込みエラー時の代替表示
<Image
  src={url}
  alt="画像"
  fill
  onError={(e) => {
    e.currentTarget.src = '/placeholder-image.png'
  }}
/>
```

---

## ✅ 実装チェックリスト

- [ ] QuestionEditorに画像アップロード機能を追加
- [ ] QuestionEditorに音声アップロード機能を追加
- [ ] QuizRunnerに画像表示機能を追加
- [ ] QuizRunnerに音声再生機能を追加
- [ ] 教科選択ページを作成
- [ ] next.config.jsにSupabaseドメインを追加
- [ ] ファイルサイズ制限のバリデーション実装
- [ ] ファイルタイプのバリデーション実装
- [ ] エラーハンドリングの実装

---

## 📚 参考資料

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Next.js Image Optimization](https://nextjs.org/docs/basic-features/image-optimization)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
