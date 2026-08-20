# Large Language Models (LLMs) Educational Tool

An interactive educational web application designed to support the teaching and learning of fundamental concepts behind Large Language Models (LLMs).
The tool uses interactive visualisations and examples to demonstrate three core concepts:

- **Tokenisation** – how text is divided into smaller units called tokens.
- **Context windows** – how the amount of available previous text can influence a model's predictions.
- **Next-word prediction** – how an LLM assigns probabilities to possible next words.

The application was developed as part of a research project exploring the use of interactive visual tools to support teachers in explaining how Large Language Models work.
You can access the deployed application here: [LLM Educational Tool](https://llm-module.vercel.app/)

---

## Features

### 1. Text Splitter: Tokenisation

The Text Splitter allows users to enter their own text and observe how it is divided into tokens.

The tool displays:

- The original input text.
- The number of words.
- The number of tokens.
- Individual token blocks.
- Spaces are visualised to make token boundaries easier to observe.

Tokenisation is performed using the `cl100k_base` tokenizer through the GPT Tokenizer browser library. If the tokenizer library is unavailable, the application uses a simpler fallback method to divide the input into words, punctuation, and whitespace.

### 2. Context Window Simulation

The Context Window module demonstrates how the amount of visible previous text can influence the next-word prediction.

Users can:

- Select different story scenarios.
- Adjust the size of the simulated context window.
- Observe which words remain visible to the model.
- See how removing earlier information can change the predicted next word.

Words outside the selected context window are visually faded to represent information that is no longer available to the simulated model.

### 3. Sentence Builder: Next-Word Prediction

The Sentence Builder allows users to enter a sentence and explore possible next-word predictions.

The application:

- Sends the entered text to a serverless prediction endpoint.
- Requests five possible next words.
- Displays the predicted words with associated probability values.
- Allows a selected word to be added to the sentence.
- Uses a temperature value to influence the variability of predictions.

The prediction endpoint uses the Groq API and the `openai/gpt-oss-20b` model to generate candidate next words.

If the API request or response fails, the application returns a predefined fallback set of predictions so that the interactive component remains functional.

### 4. Interactive Learning Flow

The application is organised into multiple interactive pages that guide users through each concept.

Each module includes a combination of:

- Short explanations.
- Visual examples.
- Interactive simulations.
- Summary pages.
- Concept review activities.

The three main concepts are introduced as:

1. **The Text Splitter** – Tokenisation.
2. **The Context Window** – The limited amount of information available to a model at one time.
3. **The Sentence Builder** – Next-word prediction using probabilities.

---

## Project Structure

```text
.
├── api/
│   └── predict.js          # Serverless API endpoint for next-word prediction
│
├── index.html              # Main application interface, styling, and client-side logic
│
└── README.md
