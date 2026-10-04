const generateQuiz = async (context) => {
  try {
    const prompt = `
You are an educational quiz generator.

Create a multiple-choice quiz using ONLY the PDF CONTENT below.

STRICT REQUIREMENTS:

- Generate exactly 10 questions.
- Every question must have exactly 4 options.
- Options must be A, B, C, and D.
- Exactly one option is correct.
- The correct answer must be one of A, B, C, or D.
- Every question and answer must be supported by the PDF content.
- Do not use outside knowledge.
- Do not invent information.
- Do not create duplicate questions.
- Cover different topics/sections from the PDF.
- Return ONLY JSON.
- Do not use Markdown.
- Do not use a code block.

The JSON MUST have exactly this structure:

{
  "questions": [
    {
      "id": 1,
      "question": "Example question?",
      "options": [
        {
          "label": "A",
          "text": "First option"
        },
        {
          "label": "B",
          "text": "Second option"
        },
        {
          "label": "C",
          "text": "Third option"
        },
        {
          "label": "D",
          "text": "Fourth option"
        }
      ],
      "correctAnswer": "A"
    }
  ]
}

PDF CONTENT:
${context}
`;

    console.log(
      "Sending quiz generation request to Ollama..."
    );

  const controller = new AbortController();

const timeout = setTimeout(() => {
  controller.abort();
}, 5 * 60 * 1000); // 5 minutes

let response;

try {
  response = await fetch(
    `${process.env.OLLAMA_BASE_URL}/api/generate`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        model:
          process.env.OLLAMA_CHAT_MODEL ||
          "llama3.2",

        prompt,

        stream: false,

        format: "json",

        options: {
          temperature: 0.2,
        },
      }),

      signal: controller.signal,
    }
  );
} finally {
  clearTimeout(timeout);
}

    if (!response.ok) {
      const errorText =
        await response.text();

      throw new Error(
        `Ollama API error: ${errorText}`
      );
    }

    const data =
      await response.json();

    console.log(
      "Ollama quiz response received."
    );

    if (!data.response) {
      throw new Error(
        "Ollama returned an empty response"
      );
    }

    console.log(
      "Raw Ollama quiz response:"
    );

    console.log(data.response);

    let quiz;

    try {
      quiz = JSON.parse(
        data.response
      );
    } catch (error) {
      console.error(
        "Quiz JSON Parse Error:",
        error
      );

      throw new Error(
        "Ollama returned invalid JSON"
      );
    }

    // Normalize the response
    quiz =
      normalizeQuizResponse(quiz);

    // Validate normalized quiz
    validateQuiz(quiz);

    return quiz.questions;

  } catch (error) {
    console.error(
      "Quiz Generation Error:",
      error
    );

    throw new Error(
      error.message ||
        "Failed to generate quiz"
    );
  }
};


/*
|--------------------------------------------------------------------------
| Normalize Quiz Response
|--------------------------------------------------------------------------
|
| Different Ollama/model versions may slightly vary the JSON structure.
| This function converts common variations into our expected format.
|
*/

const normalizeQuizResponse = (
  quiz
) => {
  if (!quiz) {
    return quiz;
  }

  // Some models may return:
  //
  // {
  //   "quiz": {
  //      "questions": [...]
  //   }
  // }
  //
  if (
    !quiz.questions &&
    quiz.quiz &&
    Array.isArray(
      quiz.quiz.questions
    )
  ) {
    quiz = quiz.quiz;
  }

  // Some models may return the questions
  // directly as an array.
  if (Array.isArray(quiz)) {
    quiz = {
      questions: quiz,
    };
  }

  if (
    !Array.isArray(
      quiz.questions
    )
  ) {
    return quiz;
  }

  quiz.questions =
    quiz.questions.map(
      (question, index) => {

        // Normalize question ID
        const normalizedQuestion = {
          id:
            question.id ||
            index + 1,

          question:
            question.question ||
            question.text ||
            question.questionText ||
            "",

          options:
            normalizeOptions(
              question.options
            ),

          correctAnswer:
            normalizeCorrectAnswer(
              question.correctAnswer ||
                question.answer ||
                question.correct ||
                question.correct_option
            ),
        };

        return normalizedQuestion;
      }
    );

  return quiz;
};


/*
|--------------------------------------------------------------------------
| Normalize Options
|--------------------------------------------------------------------------
*/

const normalizeOptions = (
  options
) => {
  if (!Array.isArray(options)) {
    return [];
  }

  return options.map(
    (option, index) => {

      const defaultLabel =
        ["A", "B", "C", "D"][index];

      if (
        typeof option ===
        "string"
      ) {
        return {
          label:
            defaultLabel,
          text: option,
        };
      }

      return {
        label:
          option.label ||
          option.key ||
          option.id ||
          defaultLabel,

        text:
          option.text ||
          option.value ||
          option.answer ||
          "",
      };
    }
  );
};


/*
|--------------------------------------------------------------------------
| Normalize Correct Answer
|--------------------------------------------------------------------------
*/

const normalizeCorrectAnswer = (
  answer
) => {
  if (
    typeof answer !== "string"
  ) {
    return "";
  }

  const cleanAnswer =
    answer
      .trim()
      .toUpperCase();

  // Direct A/B/C/D
  if (
    ["A", "B", "C", "D"].includes(
      cleanAnswer
    )
  ) {
    return cleanAnswer;
  }

  // "Option A"
  const optionMatch =
    cleanAnswer.match(
      /OPTION\s*([ABCD])/
    );

  if (optionMatch) {
    return optionMatch[1];
  }

  // "A."
  const letterMatch =
    cleanAnswer.match(
      /^([ABCD])[\.\:\)]/
    );

  if (letterMatch) {
    return letterMatch[1];
  }

  return cleanAnswer;
};


/*
|--------------------------------------------------------------------------
| Validate Quiz
|--------------------------------------------------------------------------
*/

const validateQuiz = (
  quiz
) => {

  if (
    !quiz ||
    !Array.isArray(
      quiz.questions
    )
  ) {
    console.error(
      "Quiz validation failed. Expected questions array."
    );

    console.error(
      "Received:",
      JSON.stringify(
        quiz,
        null,
        2
      )
    );

    throw new Error(
      "Invalid quiz format"
    );
  }

  if (
    quiz.questions.length !== 10
  ) {
    console.error(
      `Expected 10 questions, received ${quiz.questions.length}`
    );

    throw new Error(
      `Quiz must contain exactly 10 questions. Received ${quiz.questions.length}.`
    );
  }

  const expectedLabels = [
    "A",
    "B",
    "C",
    "D",
  ];

  quiz.questions.forEach(
    (question, index) => {

      const questionNumber =
        index + 1;

      if (
        !question.question ||
        typeof question.question !==
          "string"
      ) {
        throw new Error(
          `Question ${questionNumber} has invalid question text`
        );
      }

      if (
        !Array.isArray(
          question.options
        )
      ) {
        throw new Error(
          `Question ${questionNumber} has no valid options array`
        );
      }

      if (
        question.options.length !==
        4
      ) {
        throw new Error(
          `Question ${questionNumber} must have exactly 4 options. Received ${question.options.length}.`
        );
      }

      const labels =
        question.options.map(
          (option) =>
            option.label
        );

      if (
        JSON.stringify(labels) !==
        JSON.stringify(
          expectedLabels
        )
      ) {
        throw new Error(
          `Question ${questionNumber} options must be A, B, C and D`
        );
      }

      question.options.forEach(
        (option, optionIndex) => {

          if (
            !option.text ||
            typeof option.text !==
              "string"
          ) {
            throw new Error(
              `Question ${questionNumber}, option ${expectedLabels[optionIndex]} has invalid text`
            );
          }
        }
      );

      if (
        ![
          "A",
          "B",
          "C",
          "D",
        ].includes(
          question.correctAnswer
        )
      ) {
        throw new Error(
          `Question ${questionNumber} has invalid correct answer: ${question.correctAnswer}`
        );
      }
    }
  );

  console.log(
    "Quiz validation successful."
  );
};


module.exports = {
  generateQuiz,
};