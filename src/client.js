import OpenAI from "openai";
import ollama from "ollama";

const getOpenAIClient = () => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  return openai;
};

const getOllamaClient = () => {
  return ollama;
};

export { getOpenAIClient, getOllamaClient };
