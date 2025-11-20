import html2pdf from 'html2pdf.js'
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
  const { includeAnswers = true, orientation = 'portrait' } = options

  // HTMLコンテンツを生成
  const htmlContent = generateHTMLContent(chapterTitle, questions, includeAnswers)

  // html2pdfのオプション
  const opt = {
    margin: [8, 8, 8, 8] as [number, number, number, number],
    filename: `${chapterTitle.replace(/[\/\\?%*:|"<>]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation },
  }

  // HTMLをPDFに変換してダウンロード
  html2pdf().set(opt).from(htmlContent).save()
}

function generateHTMLContent(
  chapterTitle: string,
  questions: Question[],
  includeAnswers: boolean
): string {
  const now = new Date().toLocaleDateString('ja-JP')

  const questionsHTML = questions
    .map((question, index) => {
      const choices = [
        { label: 'A', text: question.choice_a },
        { label: 'B', text: question.choice_b },
        { label: 'C', text: question.choice_c },
        { label: 'D', text: question.choice_d },
      ]

      const choicesHTML = choices
        .map((choice) => {
          const isCorrect = includeAnswers && choice.label === question.correct_answer
          return `
            <div style="display: flex; margin-bottom: 2px; ${isCorrect ? 'font-weight: bold; color: #059669;' : ''}">
              <span style="min-width: 24px; font-weight: bold;">${choice.label}.</span>
              <span style="flex: 1;">${choice.text}</span>
              ${isCorrect ? '<span style="margin-left: 6px;">●</span>' : ''}
            </div>
          `
        })
        .join('')

      const answerLine = !includeAnswers
        ? '<div style="margin-top: 4px; padding-top: 3px; border-top: 1px solid #e5e7eb;"><span style="font-weight: bold; font-size: 8pt;">解答:</span> __________</div>'
        : ''

      return `
        <div style="margin-bottom: 10px; page-break-inside: avoid;">
          <div style="background-color: #428bca; color: white; padding: 3px 8px; font-weight: bold; margin-bottom: 3px; font-size: 9pt;">
            問題 ${index + 1}
          </div>
          <div style="padding: 4px 8px; margin-bottom: 4px; border-left: 2px solid #428bca; background-color: #f9fafb;">
            ${question.question_text}
          </div>
          <div style="padding: 0 8px;">
            ${choicesHTML}
          </div>
          ${answerLine}
        </div>
      `
    })
    .join('')

  return `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Noto Sans JP', 'Yu Gothic', 'Meiryo', sans-serif;
          font-size: 9pt;
          line-height: 1.4;
          color: #1f2937;
          padding: 12px;
        }
        .header {
          margin-bottom: 12px;
          border-bottom: 2px solid #428bca;
          padding-bottom: 8px;
        }
        .title {
          font-size: 14pt;
          font-weight: bold;
          margin-bottom: 4px;
          color: #1f2937;
        }
        .meta {
          font-size: 8pt;
          color: #6b7280;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">${chapterTitle}</div>
        <div class="meta">
          問題数: ${questions.length} | 作成日: ${now}
        </div>
      </div>
      ${questionsHTML}
    </body>
    </html>
  `
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
