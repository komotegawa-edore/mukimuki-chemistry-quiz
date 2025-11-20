import jsPDF from 'jspdf'
import { Question } from '@/lib/types/database'

export interface ExportOptions {
  includeAnswers?: boolean
  fontSize?: number
  orientation?: 'portrait' | 'landscape'
}

export function exportChapterToPDF(
  chapterTitle: string,
  questions: Question[],
  options: ExportOptions = {}
) {
  const {
    includeAnswers = true,
    fontSize = 10,
    orientation = 'portrait',
  } = options

  // PDFドキュメントを作成
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
  })

  // 日本語フォント対応のための設定（Noto Sans JPなどのフォントを使用する場合は追加設定が必要）
  // 今回はシンプルに標準フォントを使用

  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 15

  // タイトル
  doc.setFontSize(16)
  doc.text(chapterTitle, margin, 20)

  // サブタイトル
  doc.setFontSize(10)
  doc.text(`問題数: ${questions.length}`, margin, 28)
  doc.text(`作成日: ${new Date().toLocaleDateString('ja-JP')}`, margin, 33)

  let yPosition = 45

  // 各問題を出力
  questions.forEach((question, index) => {
    // ページの残りスペースをチェック
    if (yPosition > 250) {
      doc.addPage()
      yPosition = 20
    }

    // 問題番号と問題文
    doc.setFontSize(fontSize)
    doc.setFont('helvetica', 'bold')
    const questionNumber = `問題 ${index + 1}`
    doc.text(questionNumber, margin, yPosition)

    doc.setFont('helvetica', 'normal')
    const questionTextLines = doc.splitTextToSize(
      question.question_text,
      pageWidth - margin * 2 - 20
    )
    doc.text(questionTextLines, margin + 20, yPosition)
    yPosition += questionTextLines.length * 5 + 3

    // 選択肢
    const choices = [
      { label: 'A', text: question.choice_a },
      { label: 'B', text: question.choice_b },
      { label: 'C', text: question.choice_c },
      { label: 'D', text: question.choice_d },
    ]

    choices.forEach((choice) => {
      if (yPosition > 270) {
        doc.addPage()
        yPosition = 20
      }

      const isCorrect = includeAnswers && choice.label === question.correct_answer

      if (isCorrect) {
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(0, 128, 0) // 緑色
      }

      const choiceLines = doc.splitTextToSize(
        `${choice.label}. ${choice.text}`,
        pageWidth - margin * 2 - 25
      )
      doc.text(choiceLines, margin + 25, yPosition)

      if (isCorrect) {
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(0, 0, 0) // 黒色に戻す
      }

      yPosition += choiceLines.length * 5
    })

    // 解答欄（解答を含めない場合）
    if (!includeAnswers) {
      yPosition += 2
      doc.setDrawColor(200)
      doc.line(margin + 25, yPosition, margin + 60, yPosition)
      doc.setFontSize(8)
      doc.text('解答:', margin + 25, yPosition - 1)
      doc.setFontSize(fontSize)
      yPosition += 3
    }

    yPosition += 8 // 問題間のスペース
  })

  // PDFを保存
  const fileName = `${chapterTitle.replace(/[\/\\?%*:|"<>]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}

// テスト用PDF（解答なし）を生成する関数
export function exportChapterTestToPDF(
  chapterTitle: string,
  questions: Question[]
) {
  exportChapterToPDF(chapterTitle, questions, {
    includeAnswers: false,
  })
}

// 解答付きPDFを生成する関数
export function exportChapterWithAnswersToPDF(
  chapterTitle: string,
  questions: Question[]
) {
  exportChapterToPDF(chapterTitle, questions, {
    includeAnswers: true,
  })
}
