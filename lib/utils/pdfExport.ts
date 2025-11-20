import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { Question } from '@/lib/types/database'

// jspdf-autotableの型拡張
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number
    }
  }
}

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

  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 15

  // タイトル
  doc.setFontSize(16)
  doc.text(chapterTitle, margin, 20)

  // サブタイトル
  doc.setFontSize(10)
  doc.text(`問題数: ${questions.length}`, margin, 28)
  doc.text(`作成日: ${new Date().toLocaleDateString('ja-JP')}`, margin, 33)

  let startY = 40

  // 各問題を出力
  questions.forEach((question, index) => {
    // 問題番号と問題文をテーブルで表示
    ;(doc as any).autoTable({
      startY,
      head: [[`問題 ${index + 1}`]],
      body: [[question.question_text]],
      theme: 'plain',
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: [255, 255, 255],
        fontSize: 12,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: fontSize,
        cellPadding: 5,
      },
      margin: { left: margin, right: margin },
      tableWidth: pageWidth - margin * 2,
    })

    // 選択肢をテーブルで表示
    const choicesData = [
      ['A', question.choice_a, question.correct_answer === 'A' ? '●' : ''],
      ['B', question.choice_b, question.correct_answer === 'B' ? '●' : ''],
      ['C', question.choice_c, question.correct_answer === 'C' ? '●' : ''],
      ['D', question.choice_d, question.correct_answer === 'D' ? '●' : ''],
    ]

    const columns = includeAnswers
      ? ['選択肢', '内容', '正解']
      : ['選択肢', '内容']

    const bodyData = includeAnswers
      ? choicesData
      : choicesData.map((row) => [row[0], row[1]])

    ;(doc as any).autoTable({
      startY: doc.lastAutoTable.finalY + 2,
      head: [columns],
      body: bodyData,
      theme: 'grid',
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontSize: fontSize,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: fontSize,
        cellPadding: 4,
      },
      columnStyles: {
        0: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: includeAnswers ? 130 : 155 },
        ...(includeAnswers && {
          2: {
            cellWidth: 20,
            halign: 'center',
            fontStyle: 'bold',
            textColor: [0, 128, 0],
          },
        }),
      },
      margin: { left: margin, right: margin },
      tableWidth: pageWidth - margin * 2,
    })

    // 解答欄（解答を含めない場合）
    if (!includeAnswers) {
      const currentY = doc.lastAutoTable.finalY
      doc.setFontSize(fontSize)
      doc.text('解答:', margin, currentY + 8)
      doc.setDrawColor(0, 0, 0)
      doc.line(margin + 15, currentY + 8, margin + 40, currentY + 8)
      startY = currentY + 15
    } else {
      startY = doc.lastAutoTable.finalY + 10
    }
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
