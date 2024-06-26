import OpenAI from "openai";
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 8888;

const openai = new OpenAI({
  apiKey: "sk-proj-j2IPEjFvsiyyXzMR8RWUT3BlbkFJ8eSkfM0lOKO3UJ4Vgzvx",
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "client/public")));

//fetch(`http://localhost:8888/message/${className}/${diflevel}/${user.primaryEmailAddress}/${inputMsg}`)
app.get("/message/:class/:diflevel/:email/:msg", async (req, res) => {
  const className = req.params.class;
  const difLevel = req.params.diflevel;
  const email = req.params.email;
  const inputMsg = req.params.msg;

  console.log(className + " :className; ", difLevel + " :difLevel; ", email + " :email; ", inputMsg + " :inputMsg;");

  let conversations = {};
  try {
    const data = await fs.promises.readFile(
      `data/user/${email}_conversations.json`,
      "utf8"
    );
    conversations = JSON.parse(data);
  } catch (err) {
    if (err.code === "ENOENT") {
      conversations = {};
    } else {
      throw err;
    }
  }

  let formattedConversations = "None";

  if (conversations[className]) {
    formattedConversations = conversations[className]
      .map((convo) => `INPUT: "${convo.input}", OUTPUT: "${convo.output}"`)
      .join("; ");
  } else {
    conversations[className] = [];
  }

  const context = `Your duty is to be a teacher of ${className}. You will answer all questions that the user has and also make sure to explain the subjects at an ${difLevel} level for the ${className} subject. 
  You are not allowed to answer questions outside of ${className} topics. There are actually three ai teachers on the website and you are one of them. They include History, Computer Science, and Geography. 
  If they want to learn about either of the teachers specialized subjects, recommend them the proper ai teacher in the website if it is not the current subject being taught. 
  \n Here is all of your previous conversations: ${formattedConversations}`;

  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: context },
      { role: "user", content: inputMsg },
    ],
    model: "gpt-3.5-turbo",
  });

  const aiReply = completion.choices[0].message.content;

  conversations[className].push({
    input: inputMsg,
    output: aiReply,
    messageDate: new Date().toLocaleString(),
  });
  try {
    await fs.promises.writeFile(
      `data/user/${email}_conversations.json`,
      JSON.stringify(conversations, null, 2)
    );
  } catch (err) {
    throw err;
  }

  res.json({ input: inputMsg, output: aiReply });
});

app.get("/conversations/:class/:email", (req, res) => {
  const className = req.params.class;
  const email = req.params.email;

  if (!fs.existsSync(`data/user/${email}_conversations.json`)) {
    fs.writeFileSync(`data/user/${email}_conversations.json`, "{}");
  }

  fs.readFile(
    `data/user/${email}_conversations.json`,
    "utf8",
    (err, data) => {
      if (err) {
        throw err;
      }

      const conversations = data ? JSON.parse(data) : {};
      const classConversations = conversations[className] || [];
      res.json(classConversations);
    }
  );
});

app.get("/generate-quiz/:class/:email", async (req, res) => {
  const email = req.params.email;
  const className = req.params.class;

  let conversations = {};
  try {
    const data = await fs.promises.readFile(
      `data/user/${email}_conversations.json`,
      "utf8"
    );
    conversations = JSON.parse(data);
  } catch (err) {
    if (err.code === "ENOENT") {
      conversations = {};
    } else {
      throw err;
    }
  }

  let formattedConversations = "None";

  if (conversations[className]) {
    formattedConversations = conversations[className]
      .map((convo) => `INPUT: "${convo.input}", OUTPUT: "${convo.output}"`)
      .join("; ");
  } else {
    conversations[className] = [];
  }

  const context = `Your task is to create a quiz for ${className}. [{"Type":"SA","Question":"What is the largest planet in our solar system?","Answer":"Jupiter"},{"Type":"MC","Question":"What is the capital of France?","Options":[{"Answer":"Paris","Correct":true},{"Answer":"London","Correct":false},{"Answer":"Berlin","Correct":false},{"Answer":"Madrid","Correct":false}]}]
  Give me 5 questions based on the following information formated like the json above but do not give me the same questions as the examples above, it is very important not to included any text other that the json and that you dont ouput markdon syntax: ${formattedConversations}`;
  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: context }],
    model: "gpt-4-turbo",
  });

  const aiReply = JSON.parse(completion.choices[0].message.content);
  res.json(aiReply);
});

app.get("/validate-answers/:question/:answer", async (req, res) => {
  const question = req.params.question;
  const answer = req.params.answer;
  const inputMsg = `Give a yes or no response to the following: Given this question: "${question}" is the following answer correct: "${answer}"`;
  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: inputMsg }],
    model: "gpt-4-turbo",
  });

  const aiReply = completion.choices[0].message.content;
  res.end(aiReply);
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
