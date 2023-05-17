#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from "fs";
import inquirer from "inquirer";
import inquirerPath from "inquirer-file-path";
import ora from "ora";
import dotenv from "universal-dotenv";
import { ComponentConverter } from "./converter.js";
import path from "path";
import beautify from "js-beautify";

const options = {
  indent_size: 2,
  jslint_happy: true,
  end_with_newline: false,
  e4x: true,
};

const resetOptions = {
  e4x: true,
  preserve_newlines: false,
  indent_level: 0,
  indent_size: 0,
};

dotenv.init();

async function run() {
  inquirer.registerPrompt("file", inquirerPath);
  inquirer
    .prompt([
      {
        type: "file",
        name: "inputPath",
        message: "Enter the path to the input file or directory:",
        basePath: "./",
        validate: function (input) {
          if (!existsSync(input)) {
            return "Invalid path. Please enter a valid path.";
          }
          return true;
        },
      },
    ])
    .then(async (answers) => {
      const inputPath = answers.inputPath;
      const input = readFileSync(inputPath, "utf-8");
      const extension = path.extname(inputPath);
      const spinner = ora("Generating story...").start();
      const story = await ComponentConverter(input.replace(/^\s*[\r\n]/gm, "").trim(), process.env.OPENAI_API_KEY)
        .then((story) => {
          // reset indentation first
          story = beautify(story, resetOptions)
          return beautify(story, options)
        });
      writeFileSync(inputPath.replace(extension, `.story${extension}`), story);
      spinner.stop();
    });
}

await run();
