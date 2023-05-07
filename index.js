import { existsSync, readFileSync, writeFileSync } from "fs"
import inquirer from "inquirer"
import inquirerPath from "inquirer-file-path"
import ora from "ora"
import dotenv from "universal-dotenv";
import { ComponentConverter } from "./converter.js"
import path from "path"

dotenv.init();

inquirer.registerPrompt("file", inquirerPath)
inquirer
  .prompt([
    {
      type: "file",
      name: "inputPath",
      message: "Enter the path to the input file or directory:",
      basePath: "./",
      validate: function (input) {
        if (!existsSync(input)) {
          return "Invalid path. Please enter a valid path."
        }
        return true
      },
    },
  ])
  .then(async(answers) => {
    const inputPath = answers.inputPath
    const input = readFileSync(inputPath, "utf-8")
    const extension = path.extname(inputPath)
    const spinner = ora("Generating story...").start()
    const story = await ComponentConverter(input.replace(/^\s*[\r\n]/gm, "").trim(), process.env.OPENAI_API_KEY)
    writeFileSync(inputPath.replace(extension, `.story${extension}`), story)
    spinner.stop()
  })