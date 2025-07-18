import express from "express";
import bodyParser from "body-parser";
import { generatePDF } from "./utils/generatePDF.js";
import path from "path";
import { fileURLToPath } from "url";
import cors from 'cors';

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// ✅ Serve static files from resumes directory
app.use('/resumes', express.static(path.join(__dirname, 'resumes')));

app.set("views", path.join(__dirname, "templates"));
app.set("view engine", "ejs");

app.post("/generate-resume", async (req, res) => {
  try {
    const userData = req.body;
    console.log("🚀 ~ app.post ~ userData:", userData);

    const filename = await generatePDF(userData);

    const downloadLink = `http://localhost:${port}/resumes/${filename}`;

    res.json({ success: true, downloadLink });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error generating resume" });
  }
});

app.get("/", (req, res) => {
  res.send("Resume Shortlisting API is running...");
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
