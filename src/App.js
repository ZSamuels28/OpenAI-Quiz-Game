import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

function App() {
  const [category, setCategory] = useState("");
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setshowForm] = useState(false);
  const [enterAPIkey, setenterAPIkey] = useState(true)
  const [openaiApiKey, setopenaiApiKey] = useState("");

  useEffect(() => {
    if (secondsLeft === 0) {
      setSecondsLeft(30);
    }

    const timer = setTimeout(() => {
      setSecondsLeft((prevSecondsLeft) => prevSecondsLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft]);

  // Send user's input to the server and get response from ChatGPT
  const headers = {
  "Content-Type": "application/json",
  "Authorization": "Bearer " + openaiApiKey,
  };
  const requestBody = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a quiz program that is knowledgable of everything. You will only respond in proper JSON format with 10 questions and 4 answers. One answer only will be correct. The JSON will be formatted as follows: [\"question\": \"question\", \"answers\" [ {\"answer\": \"answer\", \"correct\": true}, { \"answer\": \"answer\", \"correct\": false}]},{\"question\":\"question\"] . You are ONLY to reply with the JSON and nothing else OR ELSE YOU WILL BREAK THE PROGRAM. ONLY REPLY WITH THE JSON RESPONSE.",
      },
      {
        role: "user",
        content: "Please generate a JSON quiz based on: " + category + ". Only reply with the JSON.",
      },
    ],
  };

  const handleAPIKeySubmit = async (e) => {
    e.preventDefault();
    setenterAPIkey(false);
    setshowForm(true);
  }
    
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setshowForm(false);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
      });
    const JsonResponse = await response.json(); 
    setQuizQuestions(JSON.parse(JsonResponse.choices[0].message.content));
    setIsLoading(false);
    setCurrentQuestionIndex(0);
    setSecondsLeft(30);
  };

  function nextQuestion()
  {
    setCurrentQuestionIndex(currentQuestionIndex + 1);
    setSecondsLeft(30);
  }
  
  const handleRestartClick = (event) => {
    setshowForm(true);
    setCurrentQuestionIndex(0);
    setIsGameOver(false);
    setQuizQuestions([]);
    setScore(0);
    setCategory("");
    return;
    }

  const handleAnswerClick = (event) => {
    if (currentQuestionIndex === 9) {
      setIsGameOver(true);
      return;
    }

    if (secondsLeft === 0) {
      nextQuestion();
      return;
    }
    else if (quizQuestions[currentQuestionIndex].answers[event.target.id].correct === true) {
      setScore(score + 1);
      nextQuestion();
      return;
    }
    else {
      nextQuestion();
      return;
    }
  };
  
  
  return (
    <div className="App">
      { enterAPIkey ? (
        <form onSubmit={handleAPIKeySubmit}>
        <label>Enter your OpenAI API Key:</label>
        <input type="text" value={openaiApiKey} onChange={(e) => setopenaiApiKey(e.target.value)} />
        <button type="submit" className="btn btn-primary">
          Enter
        </button>
      </form>
      ): 
      showForm ? (
        <form onSubmit={handleCategorySubmit}>
          <label>Type a Category:</label>
          <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} />
          <button type="submit" className="btn btn-primary">
            Start Quiz
          </button>
        </form>
      ) : isLoading || !quizQuestions.length ? (
        <div className="pos-center">
          <p>Generating Quiz Questions and Answers</p>
        </div>
        ) : isGameOver ? (
        <div>
          <p>Game Over!</p>
          <p>You scored {score} out of 10!</p>
          <button className="btn btn-primary mt-1 mb-1" onClick={handleRestartClick}>
                Try Again?
              </button>
        </div>
      ) : (
        <div>
          <p>Question {currentQuestionIndex + 1} of {quizQuestions.length}</p>
          <p>Time left: {secondsLeft}</p>
          <p>Score: {score}</p>
          <div className="btn-group-vertical" role="group">
            <p>{quizQuestions[currentQuestionIndex].question}</p>
            {quizQuestions[currentQuestionIndex].answers.map((answer, index) => (
              <button className="btn btn-primary mt-1 mb-1" key={index} id={index} onClick={handleAnswerClick}>
                {answer.answer}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
  

export default App;