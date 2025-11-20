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
  const { includeAnswers = true } = options

  // HTMLコンテンツを生成
  const htmlContent = generateHTMLContent(chapterTitle, questions, includeAnswers)

  // 新しいウィンドウで開いて印刷画面を表示
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(htmlContent)
    printWindow.document.close()

    // ページが完全にロードされてから印刷ダイアログを表示
    printWindow.onload = () => {
      printWindow.print()
    }
  }
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

      const choicesHTML = `
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          ${choices
            .map((choice) => {
              const isCorrect = includeAnswers && choice.label === question.correct_answer
              return `<span style="${isCorrect ? 'font-weight: bold; color: #059669;' : ''}"><strong>${choice.label}.</strong> ${choice.text}${isCorrect ? ' ●' : ''}</span>`
            })
            .join('')}
        </div>
      `

      const answerLine = !includeAnswers
        ? '<div style="margin-top: 6px;"><span style="font-weight: bold;">解答:</span> __________</div>'
        : ''

      return `
        <div style="margin-bottom: 12px; page-break-inside: avoid;">
          <div style="font-weight: bold; margin-bottom: 4px;">
            問題 ${index + 1}： ${question.question_text}
          </div>
          <div style="padding-left: 12px;">
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
          font-size: 10pt;
          line-height: 1.5;
          color: #1f2937;
          padding: 20px;
        }
        .header {
          margin-bottom: 16px;
          border-bottom: 2px solid #428bca;
          padding-bottom: 10px;
        }
        .title {
          font-size: 16pt;
          font-weight: bold;
          margin-bottom: 4px;
          color: #1f2937;
        }
        .meta {
          font-size: 9pt;
          color: #6b7280;
        }
        @media print {
          body {
            padding: 10mm;
          }
          @page {
            margin: 10mm;
            size: A4;
          }
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
