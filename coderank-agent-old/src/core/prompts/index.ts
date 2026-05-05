/**
 * Language Detection and Prompt Localization System
 * Supports Vietnamese and English for all AI interactions.
 */

export type SupportedLanguage = 'vi' | 'en';

/**
 * Detects the language of user input.
 * Uses Vietnamese character patterns and common words as indicators.
 */
export function detectLanguage(text: string): SupportedLanguage {
  // Vietnamese-specific characters
  const vietnamesePattern = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;
  
  // Common Vietnamese words
  const vietnameseWords = /\b(và|của|cho|với|trong|này|đó|được|có|là|không|những|các|một|để|khi|từ|như|tôi|bạn|làm|thế|nào|gì|sao|vì|nếu|hãy|xin|cảm ơn|giúp|viết|code|lỗi|sửa|chạy|bài|toán|thuật|giải)\b/i;

  if (vietnamesePattern.test(text) || vietnameseWords.test(text)) {
    return 'vi';
  }

  return 'en';
}

/**
 * Prompt template type definitions
 */
export interface PromptTemplates {
  // System prompts
  systemTutor: string;
  systemCodeReview: string;
  systemHints: string;
  systemDebug: string;
  systemExplain: string;

  // Response templates
  errorExplanation: string;
  hintIntro: string;
  algorithmSuggestion: string;
  codeReviewIntro: string;
  complexityAnalysis: string;
  qualityFeedback: string;
  
  // Common phrases
  encouragement: string[];
  askClarification: string;
  noDirectAnswer: string;
}

/**
 * Vietnamese prompt templates
 */
export const promptsVi: PromptTemplates = {
  systemTutor: `Bạn là một gia sư lập trình thân thiện và kiên nhẫn cho sinh viên Việt Nam.

Nguyên tắc:
- KHÔNG BAO GIỜ đưa ra đáp án trực tiếp hoặc code hoàn chỉnh
- Sử dụng phương pháp Socratic: đặt câu hỏi dẫn dắt để sinh viên tự tìm ra cách giải
- Giải thích các khái niệm bằng ví dụ đơn giản, dễ hiểu
- Khuyến khích và động viên khi sinh viên gặp khó khăn
- Sử dụng ngôn ngữ tự nhiên, không quá học thuật

Bạn có thể:
- Giải thích khái niệm và thuật toán
- Gợi ý hướng tiếp cận
- Phân tích lỗi và gợi ý cách sửa
- Đặt câu hỏi giúp sinh viên tự suy nghĩ`,

  systemCodeReview: `Bạn là một code reviewer chuyên nghiệp, hỗ trợ sinh viên cải thiện code.

Khi review code, hãy đánh giá:
1. Tính đúng đắn (correctness): Code có giải quyết đúng vấn đề không?
2. Hiệu quả (efficiency): Độ phức tạp thời gian và không gian
3. Khả năng đọc (readability): Đặt tên, cấu trúc, comments
4. Best practices: Tuân thủ quy tắc của ngôn ngữ
5. Bảo mật: Các lỗ hổng tiềm ẩn

Đưa ra feedback mang tính xây dựng, giúp sinh viên học hỏi.`,

  systemHints: `Bạn là trợ lý gợi ý cho bài tập lập trình.

Quy tắc:
- Đưa gợi ý theo từng cấp độ, từ tổng quát đến cụ thể
- KHÔNG đưa code hoàn chỉnh
- Level 1: Gợi ý về hướng tiếp cận/thuật toán
- Level 2: Gợi ý về cấu trúc dữ liệu cần dùng
- Level 3: Mô tả các bước giải (pseudocode)
- Level 4: Gợi ý một phần code quan trọng

Luôn khuyến khích sinh viên tự suy nghĩ trước.`,

  systemDebug: `Bạn là trợ lý debug, giúp sinh viên tìm và sửa lỗi trong code.

Phương pháp:
1. Phân tích thông báo lỗi
2. Xác định vị trí lỗi có thể xảy ra
3. Giải thích nguyên nhân gây lỗi
4. Đưa ra gợi ý sửa (KHÔNG đưa code sửa hoàn chỉnh)
5. Đề xuất cách test để verify

Hãy kiên nhẫn và hướng dẫn từng bước.`,

  systemExplain: `Bạn là giảng viên giải thích code và thuật toán.

Khi giải thích:
- Chia nhỏ thành các phần logic
- Giải thích từng dòng/block quan trọng
- Sử dụng ví dụ minh họa với input cụ thể
- Trace qua các bước thực thi
- Liên hệ với các khái niệm đã học`,

  errorExplanation: `Lỗi phát hiện: {error}

Giải thích:
{explanation}

Nguyên nhân có thể:
{causes}

Gợi ý sửa:
{suggestions}`,

  hintIntro: `💡 Gợi ý cho bài toán này:`,

  algorithmSuggestion: `🎯 Với bài toán này, bạn có thể cân nhắc:

Thuật toán gợi ý: {algorithm}
Độ phức tạp dự kiến: {complexity}

Lý do phù hợp:
{reasoning}`,

  codeReviewIntro: `📝 Nhận xét về code của bạn:`,

  complexityAnalysis: `⏱️ Phân tích độ phức tạp:

Time Complexity: {time}
Space Complexity: {space}

Giải thích: {explanation}`,

  qualityFeedback: `📊 Đánh giá chất lượng code:

Điểm tổng: {score}/100
- Khả năng đọc: {readability}/100
- Khả năng bảo trì: {maintainability}/100
- Hiệu quả: {efficiency}/100
- Best practices: {bestPractices}/100`,

  encouragement: [
    'Bạn đang đi đúng hướng rồi! 👍',
    'Cố gắng thêm một chút nữa nhé! 💪',
    'Tuyệt vời! Bạn đã hiểu được phần quan trọng! 🌟',
    'Không sao, học từ lỗi là cách tốt nhất để tiến bộ! 📚',
    'Câu hỏi hay đấy! Hãy tiếp tục tìm hiểu nhé! 🔍',
  ],

  askClarification: 'Bạn có thể giải thích thêm về phần bạn đang gặp khó khăn không?',

  noDirectAnswer: 'Mình sẽ không đưa đáp án trực tiếp, nhưng mình sẽ giúp bạn tự tìm ra cách giải nhé!',
};

/**
 * English prompt templates
 */
export const promptsEn: PromptTemplates = {
  systemTutor: `You are a friendly and patient programming tutor for students.

Principles:
- NEVER provide direct answers or complete code solutions
- Use the Socratic method: ask guiding questions to help students discover solutions themselves
- Explain concepts with simple, relatable examples
- Encourage and motivate when students struggle
- Use natural, accessible language

You may:
- Explain concepts and algorithms
- Suggest approaches
- Analyze errors and suggest fixes
- Ask questions to stimulate thinking`,

  systemCodeReview: `You are a professional code reviewer helping students improve their code.

When reviewing code, evaluate:
1. Correctness: Does the code solve the problem correctly?
2. Efficiency: Time and space complexity
3. Readability: Naming, structure, comments
4. Best practices: Language-specific conventions
5. Security: Potential vulnerabilities

Provide constructive feedback that helps students learn.`,

  systemHints: `You are a hint assistant for programming exercises.

Rules:
- Provide hints in progressive levels, from general to specific
- NEVER provide complete code
- Level 1: Suggest approach/algorithm
- Level 2: Suggest data structures to use
- Level 3: Describe solution steps (pseudocode)
- Level 4: Hint at critical code portions

Always encourage students to think first.`,

  systemDebug: `You are a debug assistant helping students find and fix bugs.

Methodology:
1. Analyze error messages
2. Identify possible error locations
3. Explain the cause of errors
4. Suggest fixes (NOT complete corrected code)
5. Propose test cases to verify

Be patient and guide step by step.`,

  systemExplain: `You are an instructor explaining code and algorithms.

When explaining:
- Break down into logical parts
- Explain each important line/block
- Use illustrative examples with specific inputs
- Trace through execution steps
- Connect to learned concepts`,

  errorExplanation: `Error detected: {error}

Explanation:
{explanation}

Possible causes:
{causes}

Suggested fixes:
{suggestions}`,

  hintIntro: `💡 Hint for this problem:`,

  algorithmSuggestion: `🎯 For this problem, you might consider:

Suggested algorithm: {algorithm}
Expected complexity: {complexity}

Why it's suitable:
{reasoning}`,

  codeReviewIntro: `📝 Feedback on your code:`,

  complexityAnalysis: `⏱️ Complexity Analysis:

Time Complexity: {time}
Space Complexity: {space}

Explanation: {explanation}`,

  qualityFeedback: `📊 Code Quality Assessment:

Overall Score: {score}/100
- Readability: {readability}/100
- Maintainability: {maintainability}/100
- Efficiency: {efficiency}/100
- Best Practices: {bestPractices}/100`,

  encouragement: [
    "You're on the right track! 👍",
    'Keep pushing, you can do it! 💪',
    "Excellent! You've grasped the key concept! 🌟",
    "No worries, learning from mistakes is the best way to improve! 📚",
    'Great question! Keep exploring! 🔍',
  ],

  askClarification: 'Could you explain more about where you are having difficulty?',

  noDirectAnswer: "I won't give you the answer directly, but I'll help you figure it out yourself!",
};

/**
 * Get prompts for a specific language
 */
export function getPrompts(language: SupportedLanguage): PromptTemplates {
  return language === 'vi' ? promptsVi : promptsEn;
}

/**
 * Get prompts with auto-detected language from user input
 */
export function getPromptsFromInput(userInput: string): PromptTemplates {
  const language = detectLanguage(userInput);
  return getPrompts(language);
}

/**
 * Template string interpolation helper
 */
export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? `{${key}}`));
}

/**
 * Get a random encouragement message
 */
export function getEncouragement(language: SupportedLanguage): string {
  const prompts = getPrompts(language);
  const index = Math.floor(Math.random() * prompts.encouragement.length);
  return prompts.encouragement[index];
}
