import { useEffect,useRef,useState,} from "react";

import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";

const Quiz = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const quizRequested = useRef(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [selectedAnswer, setSelectedAnswer] =
    useState(null);

  const [answers, setAnswers] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [finished, setFinished] =
    useState(false);

  const [score, setScore] = useState(0);

  const generateQuiz = async () => {
    try {
      setLoading(true);
      setError("");

      setQuestions([]);
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setAnswers({});
      setFinished(false);
      setScore(0);

      const response =
        await API.post(
          "/quiz/generate",
          {
            documentId,
          }
        );

      if (
        !response.data.success ||
        !response.data.questions
      ) {
        throw new Error(
          "Invalid quiz response"
        );
      }

      setQuestions(
        response.data.questions
      );

    } catch (error) {
      console.error(
        "Quiz Generation Error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to generate quiz."
      );
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  if (quizRequested.current) {
    return;
  }

  quizRequested.current = true;

  generateQuiz();
}, [documentId]);

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: answer,
    }));
  };

  const handleNext = () => {
    if (!selectedAnswer) {
      return;
    }

    if (
      currentQuestion ===
      questions.length - 1
    ) {
      let finalScore = 0;

      questions.forEach(
        (question, index) => {
          const answer =
            index === currentQuestion
              ? selectedAnswer
              : answers[index];

          if (
            answer ===
            question.correctAnswer
          ) {
            finalScore++;
          }
        }
      );

      setScore(finalScore);
      setFinished(true);

      return;
    }

    setCurrentQuestion(
      (prev) => prev + 1
    );

    setSelectedAnswer(
      answers[currentQuestion + 1] ||
        null
    );
  };

  const getScorePercentage = () => {
    if (!questions.length) {
      return 0;
    }

    return Math.round(
      (score / questions.length) *
        100
    );
  };

  if (loading) {
    return (
      <div className="quiz-page">
        <div className="quiz-loading">
          <div className="quiz-loading-icon">
            🧠
          </div>

          <h2>
            Generating your quiz...
          </h2>

          <p>
            Reading the PDF and creating
            questions.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-page">
        <div className="quiz-error">
          <h2>
            Unable to generate quiz
          </h2>

          <p>{error}</p>

          <div className="quiz-actions">
            <button
              className="primary-button"
              onClick={generateQuiz}
            >
              Try Again
            </button>

            <button
              className="secondary-button"
              onClick={() =>
                navigate(
                  `/chat/${documentId}`
                )
              }
            >
              Back to PDF
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (finished) {
    const percentage =
      getScorePercentage();

    return (
      <div className="quiz-page">
        <div className="quiz-result">

          <div className="result-icon">
            🎉
          </div>

          <h1>
            Quiz Completed!
          </h1>

          <div className="score-circle">
            <strong>
              {score}
            </strong>

            <span>
              / {questions.length}
            </span>
          </div>

          <h2>
            Score: {percentage}%
          </h2>

          <p>
            You answered{" "}
            <strong>
              {score}
            </strong>{" "}
            out of{" "}
            <strong>
              {questions.length}
            </strong>{" "}
            questions correctly.
          </p>

          <div className="quiz-actions">

            <button
              className="primary-button"
              onClick={generateQuiz}
            >
              Try Again
            </button>

            <button
              className="secondary-button"
              onClick={() =>
                navigate(
                  `/chat/${documentId}`
                )
              }
            >
              Back to PDF
            </button>

          </div>

        </div>
      </div>
    );
  }

  const question =
    questions[currentQuestion];

  const progress =
    ((currentQuestion + 1) /
      questions.length) *
    100;

  return (
    <div className="quiz-page">

      <div className="quiz-container">

        <div className="quiz-header">

          <button
            className="back-button"
            onClick={() =>
              navigate(
                `/chat/${documentId}`
              )
            }
          >
            ← Back to PDF
          </button>

          <h1>
            PDF Quiz
          </h1>

          <p>
            Test your understanding of
            the uploaded document.
          </p>

        </div>

        <div className="quiz-progress">

          <div className="quiz-progress-info">
            <span>
              Question{" "}
              {currentQuestion + 1} of{" "}
              {questions.length}
            </span>

            <span>
              {Math.round(progress)}%
            </span>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

        </div>

        <div className="quiz-card">

          <div className="question-number">
            Question{" "}
            {currentQuestion + 1}
          </div>

          <h2>
            {question.question}
          </h2>

          <div className="quiz-options">

            {question.options.map(
              (option) => (
                <button
                  key={option.label}
                  className={`quiz-option ${
                    selectedAnswer ===
                    option.label
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    handleAnswer(
                      option.label
                    )
                  }
                >
                  <span className="option-label">
                    {option.label}
                  </span>

                  <span className="option-text">
                    {option.text}
                  </span>
                </button>
              )
            )}

          </div>

          <button
            className="quiz-next-button"
            onClick={handleNext}
            disabled={!selectedAnswer}
          >
            {currentQuestion ===
            questions.length - 1
              ? "Finish Quiz"
              : "Next Question →"}
          </button>

        </div>

      </div>

    </div>
  );
};

export default Quiz;