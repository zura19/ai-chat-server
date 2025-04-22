import OpenAi from "openai";
import dotenv from "dotenv";

dotenv.config();

const openAI = new OpenAi({
  apiKey: process.env.OPENAI_API_KEY,
});
// const openAI = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

export default openAI;

// const completion = openai.chat.completions.create({
//   model: "gpt-4o-mini",
//   store: true,
//   messages: [{ role: "user", content: "write a haiku about ai" }],
// });

// completion.then((result) => console.log(result.choices[0].message));
